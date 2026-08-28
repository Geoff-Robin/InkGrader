# Student-Level Cache Updates for Grading Progress (replace exam-level invalidation)

## 1. Context

Problem: when a worker finishes grading one student, `grading_task.py` publishes a Redis message that the gateway relays verbatim over WS. `frontend/hooks/useExamUpdates.ts:24` responds by calling `invalidateQueries(["exam-students", examId])` — this invalidates the **entire student list query** for the exam, regardless of which single student finished. With N students finishing close together (3 worker replicas grading concurrently), this fires up to N near-simultaneous refetches of the full list — a refetch storm.

Goal: react to each WS message by patching only the affected student's entry directly in the React Query cache (`setQueryData`/`setQueriesData`), eliminating the network refetch entirely for the common case. Polling (`refetchInterval: 5000` on the list query) stays as a correctness backstop — this is an optimization on top of it, not a replacement.

Non-goals:
- Not touching `gateway.py` — it already relays the Redis payload verbatim; no code change needed there.
- Not restructuring `refetchInterval` polling or auth/userId plumbing into `useExamUpdates` beyond what's needed for cache-key matching.
- Not building a generic per-question diffing engine — student detail patch is a straightforward field overwrite.

## 2. Current state (from exploration)

**Backend publish** — `backend/core/Grading/grading_task.py:74-81`, inside `grade_student()`:
```python
payload = {
    "exam_id": str(exam_id),
    "student_id": str(student_id),
    "message": f"Job has been finished for student {student_id} and exam {exam_id}"
}
await publish_grading_update(payload)
```
Published on both success and failure paths, identically — no `status`, `marks`, or per-question data, even though `total_marks` (int) and per-answer `ans.marks` are in scope at that point (lines 61-62).

**Gateway** — `backend/gateway/gateway.py:39-55` parses the Redis message as JSON and forwards it unchanged to every WS client subscribed to that `exam_id`. No changes needed here — richer payload flows through automatically.

**Frontend consumer** — `frontend/hooks/useExamUpdates.ts:20-29`, `onmessage`:
```ts
const payload = JSON.parse(event.data);
if (payload.exam_id) {
  queryClient.invalidateQueries({ queryKey: ["exam-students", payload.exam_id] });
}
```

**List query** — `frontend/app/home/exams/[id]/page.tsx:51-74`:
- `queryKey: ["exam-students", id, userId, showGraded]`
- `queryFn` fetches `GET /api/proxy/exam/${id}/students?graded=${showGraded}`, maps backend `Student[]` (`{id, marks}`) into UI shape: `{id, name, status: marks != null ? "completed" : "pending", score: marks, total_score: 100, submitted_at}`
- `Student` interface (lines 26-33): `status: "pending" | "grading" | "completed" | "failed"`

**Detail query** — `frontend/app/home/exams/[id]/students/[student_id]/page.tsx:53-56`:
- `queryKey: ["student-result", id, student_id, userId]`
- fetches `GET /api/proxy/exam/${id}/students/${student_id}` → `{student_id, total_marks, results: [{question_id, question_number, question_text, topic, max_marks, student_answer, awarded_marks}]}`

No `setQueryData` calls exist anywhere in the frontend today — this introduces the pattern fresh.

## 3. Proposed Design

### 3a. Data Model Changes (WS payload contract)

Not a DB schema change, but a public message-contract change (Redis pub/sub payload → WS message), so calling it out:

**Entity affected**: the `grading_updates` pub/sub message shape (`GradingUpdatePayload`, informal).

**Old shape**:
```json
{"exam_id": "...", "student_id": "...", "message": "Job has been finished for student ... and exam ..."}
```

**New shape**:
```json
{
  "exam_id": "...",
  "student_id": "...",
  "status": "succeeded" | "failed",
  "total_marks": 87,           // int, null if grading failed
  "answers": [                  // [] if grading failed
    {"question_id": "...", "marks": 5}
  ]
}
```
- New fields: `status` (str, required), `total_marks` (int|null), `answers` (list, required, possibly empty).
- Removed: `message` (was human-readable only, unused by frontend, safe to drop — grep confirms no consumer reads it).
- No migration/backfill: this is a live pub/sub message, not persisted state. Old-shape messages simply won't exist post-deploy since publisher and consumer deploy together.
- **Consumers affected**: `gateway.py` (no change — passthrough), `useExamUpdates.ts` (must be updated to read new fields).

### 3b. Increments

**Increment 0 (frontend, scaffolding) — DONE**
- Vitest test runner is installed and wired: `vitest`, `@vitejs/plugin-react@^4` (pinned off latest 6.x, which pulls a babel-8/rolldown peer chain that conflicts with `shadcn`'s babel-7 deps), `vite-tsconfig-paths` (resolves the `@/*` alias from `tsconfig.json`), `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- New files: `frontend/vitest.config.ts` (jsdom environment, tsconfig-paths + react plugins, `globals: true`), `frontend/vitest.setup.ts` (imports `@testing-library/jest-dom/vitest`).
- `frontend/package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- Verified with a throwaway smoke test (`expect(true).toBe(true)`) — `npm run test` passed, 1/1. Smoke test file will be deleted once Increment 2's real Red test exists in its place.
- This unblocks real Red-Green-Refactor for Increments 2 and 3 below — no more "manual verification only" carve-out.

**Increment 1 (backend, Red-Green-Refactor) — enrich the publish payload**
- File: `backend/core/Grading/grading_task.py` (`grade_student()`, replacing lines 74-81)
- Red: in `backend/core/tests/test_grading_task.py`, add a test that mocks/spies `publish_grading_update` and asserts the call includes `status`, `total_marks`, and `answers` (list of `{question_id, marks}`) for both a successful grade and a failure path. Run scoped: `uv run --package inkgrader-core pytest tests/test_grading_task.py::<new_test> -x` from `backend/core/`. Confirm it fails against current payload (missing keys).
- Green: build the payload from values already in scope in `grade_student()` — `total_marks` on success, `None` on failure; `answers` built from the per-answer loop that already computes `ans.marks` (line 61), collecting `{"question_id": str(ans.question_id), "marks": ans.marks}`; `status` set to `"succeeded"`/`"failed"` matching the existing success/failure branch.
- Confirm pass, then run full package suite: `uv run --package inkgrader-core pytest` from `backend/core/`.
- Refactor: no structural change expected beyond payload construction; keep it inline, this isn't complex enough to warrant a helper.

**Increment 2 (frontend, Red-Green-Refactor) — patch the list cache**
- File under test: `frontend/hooks/useExamUpdates.ts`. New test file: `frontend/hooks/useExamUpdates.test.ts` (replaces the Increment-0 smoke test).
- Test setup: `renderHook(() => useExamUpdates(examId), { wrapper })` where `wrapper` provides a real `QueryClientProvider` around a test `QueryClient`; seed the cache first via `queryClient.setQueryData(["exam-students", examId, userId, showGraded], [...fixture students])`. Mock the global `WebSocket` (`vi.stubGlobal("WebSocket", MockWebSocket)`) so the test can synthesously invoke the hook's `onmessage` with a constructed payload (`{exam_id, student_id, status, total_marks, answers}`).
- Red (write first, confirm failing):
  1. `it("patches the matching student in place instead of invalidating")` — after `onmessage`, assert `queryClient.getQueryData([...])` has the one student's `status`/`score` updated, and assert the list `queryFn` mock was **not** called again (no refetch).
  2. `it("removes a newly-graded student from an ungraded-only view")` — seed a `showGraded=false` cached list containing the student, fire a `succeeded` message, assert the student is filtered out of that cached array.
  3. `it("adds a newly-graded student into a graded-only view")` — mirror case for `showGraded=true`.
  Run scoped: `npm run test -- useExamUpdates` from `frontend/`. Confirm all three fail against the current `invalidateQueries` implementation (it won't touch the array at all — old test assertions on patched fields fail).
- Green: replace the `invalidateQueries` call in `useExamUpdates.ts` with `queryClient.setQueriesData<Student[]>({ queryKey: ["exam-students", payload.exam_id], exact: false }, (old, query) => {...})`, using the `updater(old, query)` overload so `query.queryKey[3]` (the `showGraded` filter param) is available per matched cached query — needed since multiple list queries (different filter values) can be cached simultaneously and each must add/remove the student correctly for its own filter. Logic: build the patched `Student` record from `payload` (`status: payload.status === "succeeded" ? "completed" : "failed"`, `score: payload.total_marks`), decide `belongsInThisView` from `showGraded` vs the new status, then filter-out/insert/map accordingly.
- Confirm pass: `npm run test -- useExamUpdates`, then full suite `npm run test`.
- Refactor: extract the "does this student belong in this filtered view" predicate into a small named function only if the inline ternary reads unclearly once real code is in front of you — don't pre-build an abstraction now.
- `refetchInterval: 5000` on the list query is left untouched as a correctness backstop for missed/dropped WS messages.

**Increment 3 (frontend, Red-Green-Refactor) — patch the detail cache**
- Same test file, additional cases:
  1. `it("patches an open student-detail cache entry's marks in place")` — seed `["student-result", examId, studentId, userId]` with a fixture `StudentResult`, fire a WS message carrying `answers: [{question_id, marks}]`, assert `total_marks` and the matching `results[].awarded_marks` updated, and that no `GET` refetch occurred.
  2. `it("no-ops when the student's detail page was never cached")` — fire a message for a student with no cached detail query, assert nothing throws and no query is created.
- Red: confirm these fail (hook currently does nothing with detail-level cache — only the exam-wide invalidate exists).
- Green: in `useExamUpdates.ts`, add `queryClient.setQueriesData<StudentResult>({ queryKey: ["student-result", payload.exam_id, payload.student_id], exact: false }, (old) => old ? { ...old, total_marks: payload.total_marks, results: old.results.map((r) => { const match = payload.answers.find((a) => a.question_id === r.question_id); return match ? { ...r, awarded_marks: match.marks } : r; }) } : old)`. `exact: false` on the 3-part prefix matches regardless of the trailing `userId` segment, so `userId` doesn't need to be threaded into the hook.
- Confirm pass, run full suite.

### 4. Alternatives Considered

- **Debounce/batch the existing `invalidateQueries` call** (e.g. collect student_ids over a short window, invalidate once) instead of enriching the payload and patching directly. Rejected: still causes a full-list network refetch per batch window, just fewer of them — doesn't eliminate the storm, only throttles it, and adds timer/cleanup complexity to the WS hook for a worse end result than direct patching.
- **Have the frontend refetch just the one student's detail endpoint on WS message, then merge into the list** instead of enriching the WS payload itself. Rejected: still a network round-trip per student-completion event (same storm shape, just against a smaller endpoint), and duplicates data the worker already computed and could have pushed for free.

## 5. Verification

- Backend: `uv run --package inkgrader-core pytest` from `backend/core/` (new + existing tests green).
- Frontend automated: `npm run test` from `frontend/` (Vitest — new `useExamUpdates.test.ts` cases plus full suite green).
- Frontend manual pass (belt-and-suspenders on top of the automated tests, since this is WS/network timing behavior):
  1. `npm run dev` in `frontend/`, open an exam with 5+ ungraded students in one tab and one student's detail page in another.
  2. Submit/trigger grading for multiple students close together (simulating worker concurrency).
  3. Confirm via browser DevTools Network tab: zero `GET /api/proxy/exam/{id}/students` calls fire in response to WS messages (only the existing 5s poll, if it lands), rows update in place with correct status/score, and the open detail tab's marks update live.
  4. Toggle the graded/ungraded filter mid-test to confirm add/remove-from-view logic is correct.
