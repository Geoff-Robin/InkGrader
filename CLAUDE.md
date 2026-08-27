# InkGrader

AI-powered grading system for handwritten exam submissions. OCR extraction + LLM scoring, queued through Redis, pushed live to the frontend over WebSocket.

## Project structure

### `backend/` — FastAPI (Python 3.12, `uv`, pytest)

Two separate ASGI apps, run as separate processes/containers:

- `app.py` — main API (port 8000). On startup spawns the Redis queue consumer (`run_grading_worker`) as an asyncio task in-process.
- `gateway.py` — WebSocket relay only (port 8001). Subscribes to Redis pub/sub channel `grading_updates`, forwards messages to browsers on `/ws/exam/{exam_id}`.
- `routes.py` — HTTP endpoints: exam creation (`POST /api/exam/`), answer submission (`POST /api/exam/{exam_id}/answers`), student/exam reads.

Subpackages:
- `Agents/` — LLM call wrappers around Groq. `extraction_agent.py` (OCR text → structured questions/answers/rubrics), `grading_agent.py` (question+rubric+answer → marks). `prompts.py` and `models.py` hold the prompt strings and structured-output schemas. Each call is a single-shot Groq chat completion with a forced JSON schema — **not** a tool-calling/agentic loop, despite the folder name. `tools.py` defines an unused `rag_tool()` (pgvector similarity search) that is not wired into any Groq call — don't assume RAG grading is active without checking.
- `FileProcessor/` — PDF/image parsing and OCR.Space integration; extracts questions, rubrics, and answers from uploaded files.
- `Grading/` — `queue.py` (Redis `BLPOP` job queue + pub/sub publish), `grading_task.py` (per-student grading orchestration, fans out over a student's answers with `asyncio.gather`).
- `Database/` — SQLAlchemy 2.0 models (`Exam`, `Question`, `Answers`, `Student`, `KnowledgeBase`) and one DAL per model. `locks.py` provides a Postgres advisory lock keyed on `student_id` to prevent double-grading races (no-ops outside Postgres).
- `tests/` — pytest + pytest-asyncio. Existing coverage: `test_database.py`, `test_file_processor.py`, `test_grading_agent.py`. Run with `uv run pytest` from `backend/`.

### `frontend/` — Next.js 16 App Router (TypeScript)

- `app/` — routes/layouts (route groups: `(landing_page)`, `home`, `login`, `signup`, plus `api/` for Next-side API routes).
- `components/` — shadcn/ui-based components (`ui/`, `dashboard/`, `providers/`).
- `hooks/` — client hooks, notably `useExamUpdates.ts` (opens the gateway WebSocket, calls `queryClient.invalidateQueries(["exam-students", examId])` on message — this is client-side only, needs `"use client"`, cannot run in a server component).
- `drizzle/` + `auth-schema.ts` + `drizzle.config.ts` — Drizzle ORM schema/migrations for Better Auth (separate from the backend's SQLAlchemy/Postgres grading data).
- No test runner is configured (no jest/vitest in `package.json`) — frontend changes are currently unverified by automated tests.

### Data flow (grading)

`routes.py` submission → OCR + `ExtractionAgent` → `Answers` rows → enqueue `GradingInfo` on Redis → `grading_task.py` worker grades concurrently per student → `Answers`/`Student` marks persisted → publish to `grading_updates` → `gateway.py` relays over WS → `useExamUpdates.ts` invalidates the *whole* `exam-students` query for the exam (not scoped per-student — be aware this can cause redundant refetches when many students finish close together).

## Keep the CocoIndex search index in sync

- After any code change (add, modify, rename, delete), run `ccc index` before running another `ccc search`.
- Index immediately after each change — don't batch several edits and index once at the end.
- If `ccc search` results look stale or miss a recent change, run `ccc index` and retry the search.

## When to use `ccc search` vs grep

- Use `ccc search` for open-ended or semantic questions — "where do we handle auth token refresh," "what validates user input before it hits the DB," "how is retry logic implemented" — anything where you don't know the exact string/pattern to grep for, or where the answer could be phrased many different ways across the codebase.
- Use grep/regex only when you already know the exact literal, symbol name, or pattern to match (e.g. a specific function name, import path, or error string).
- Default to `ccc search` first when exploring unfamiliar code or answering "how/where does X work" questions — fall back to grep only once you've narrowed down specific identifiers to chase.

## Plan mode: plans must be structured as TDD cycles

When producing a plan (plan mode) for any change to `backend/`, structure it as a sequence of **Red → Green → Refactor** cycles, not as a flat list of implementation steps. Each cycle in the plan must name:

1. **Red** — the exact test file (existing under `backend/tests/`, or a new one) and the exact test case(s)/assertions to add, describing the behavior before any implementation exists. State that the test is expected to fail, and why (missing function, wrong output, etc.).
2. **Green** — the minimal implementation change (exact files) needed to make that test pass. No extra scope beyond what the test requires.
3. **Refactor** — any cleanup to do once green, only if needed, keeping the same tests passing. Skip this step in the plan if there's nothing to refactor — don't pad it.

Rules for applying this:
- Break the overall change into the smallest set of independent cycles that make sense — one cycle per behavior, not one cycle for the entire feature.
- Order cycles so each is runnable/testable on its own (`uv run pytest` from `backend/`) before moving to the next.
- For `frontend/` changes: no test runner exists yet. Plans touching frontend logic worth unit-testing should call this out explicitly and ask whether to (a) add a minimal test runner as its own first cycle, or (b) proceed without tests — don't silently skip the question.
- Don't invent tests for trivial/typo-level changes or pure config/markup edits — TDD structure applies to behavior changes, not everything.
