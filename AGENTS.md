# InkGrader

AI-powered grading system for handwritten exam submissions. OCR extraction + LLM scoring, queued through Postgres and graded by a replicated worker pool, pushed live to the frontend over WebSocket via Redis pub/sub.

## Project structure

### `backend/` — a `uv` workspace (Python 3.12, pytest), 4 independently deployable services

`backend/pyproject.toml` is a virtual workspace root (`[tool.uv.workspace]`, no code of its own) with one shared `uv.lock`. Each member below has its own `pyproject.toml`, dependency set, and `Dockerfile`; `api`/`worker` pull in `core` as a local path dependency (`inkgrader-core`), `gateway` doesn't depend on it at all.

- `core/` — shared business logic, not a running process on its own:
  - `Agents/` — LLM call wrappers around Groq. `extraction_agent.py` (OCR text → structured questions/answers/rubrics), `grading_agent.py` (question+rubric+answer → marks). `prompts.py` and `models.py` hold the prompt strings and structured-output schemas. Each call is a single-shot Groq chat completion with a forced JSON schema — **not** a tool-calling/agentic loop, despite the folder name. `tools.py` defines an unused `rag_tool()` (pgvector similarity search) that is not wired into any Groq call — don't assume RAG grading is active without checking.
  - `FileProcessor/` — PDF/image parsing and OCR.Space integration; extracts questions, rubrics, and answers from uploaded files.
  - `Grading/` — `queue.py` (Postgres `grading_jobs` table job queue, claimed via `SELECT ... FOR UPDATE SKIP LOCKED` + Redis pub/sub publish of completions), `grading_task.py` (per-student grading orchestration, fans out over a student's answers with `asyncio.gather`).
  - `Database/` — SQLAlchemy 2.0 models (`Exam`, `Question`, `Answers`, `Student`, `KnowledgeBase`, `GradingJob`) and one DAL per model. `locks.py` provides a Postgres advisory lock keyed on `student_id` to prevent double-grading races (no-ops outside Postgres).
  - `tests/` — pytest + pytest-asyncio: `test_database.py`, `test_file_processor.py`, `test_grading_agent.py`, `test_grading_task.py`, `test_grading_queue.py` (covers the `SKIP LOCKED` claim safety multiple worker replicas depend on). Run with `uv run --package inkgrader-core pytest` from `backend/core/`.
- `api/` — the HTTP API (port 8000): `app.py` (FastAPI app, DB schema init on startup), `routes.py` (exam creation `POST /api/exam/`, answer submission `POST /api/exam/{exam_id}/answers`, student/exam reads). No longer runs the grading worker in-process.
- `worker/` — `worker.py`: standalone entrypoint that runs `run_grading_worker()` (from `core`'s `Grading` package) forever. No HTTP surface. Runs at **3 replicas** in `docker-compose.yml` (`grading-worker` service, `deploy.replicas: 3`), safe because of the `SKIP LOCKED` claim and per-student advisory lock above.
- `gateway/` — `gateway.py`, WebSocket relay only (port 8001). Subscribes to Redis pub/sub channel `grading_updates`, forwards messages to browsers on `/ws/exam/{exam_id}`. Has zero dependency on `core` — its own minimal `pyproject.toml` (`fastapi`, `redis`, `python-dotenv` only).

### `frontend/` — Next.js 16 App Router (TypeScript)

- `app/` — routes/layouts (route groups: `(landing_page)`, `home`, `login`, `signup`, plus `api/` for Next-side API routes).
- `components/` — shadcn/ui-based components (`ui/`, `dashboard/`, `providers/`).
- `hooks/` — client hooks, notably `useExamUpdates.ts` (opens the gateway WebSocket, calls `queryClient.invalidateQueries(["exam-students", examId])` on message — this is client-side only, needs `"use client"`, cannot run in a server component).
- `drizzle/` + `auth-schema.ts` + `drizzle.config.ts` — Drizzle ORM schema/migrations for Better Auth (separate from the backend's SQLAlchemy/Postgres grading data).
- No test runner is configured (no jest/vitest in `package.json`) — frontend changes are currently unverified by automated tests.

### Data flow (grading)

`routes.py` (in `api/`) submission → OCR + `ExtractionAgent` → `Answers` rows → enqueue `GradingInfo` as rows in the Postgres `grading_jobs` table → one of the 3 `worker/worker.py` replicas claims a batch (`FOR UPDATE SKIP LOCKED`) and `grading_task.py` grades concurrently per student → `Answers`/`Student` marks persisted → publish to Redis `grading_updates` → `gateway/gateway.py` relays over WS → `useExamUpdates.ts` invalidates the *whole* `exam-students` query for the exam (not scoped per-student — be aware this can cause redundant refetches when many students finish close together).

## Keep the CocoIndex search index in sync

- After any code change (add, modify, rename, delete), run `ccc index` before running another `ccc search`.
- Index immediately after each change — don't batch several edits and index once at the end.
- If `ccc search` results look stale or miss a recent change, run `ccc index` and retry the search.

## When to use `ccc search` vs grep

- Use `ccc search` for open-ended or semantic questions — "where do we handle auth token refresh," "what validates user input before it hits the DB," "how is retry logic implemented" — anything where you don't know the exact string/pattern to grep for, or where the answer could be phrased many different ways across the codebase.
- Use grep/regex only when you already know the exact literal, symbol name, or pattern to match (e.g. a specific function name, import path, or error string).
- Default to `ccc search` first when exploring unfamiliar code or answering "how/where does X work" questions — fall back to grep only once you've narrowed down specific identifiers to chase.

## Plan Mode: Technical Design Document Format

When entering plan mode, do not produce a simple task checklist. Structure the plan as a Technical Design Document (TDD) with the following sections:

### 1. Overview
- One-paragraph problem statement: what is being built/changed and why
- Goals (what this plan solves)
- Non-goals (explicitly out of scope, to prevent scope creep)

### 2. Context
- Current state of the relevant code/system
- Relevant files, modules, and functions (use exact paths, e.g. `src/api/auth.ts`)
- Constraints (existing conventions, dependencies, backward compatibility requirements)

### 3. Proposed Design
- High-level architecture / approach
- Data flow or sequence of operations
- Key abstractions, interfaces, or types being introduced or modified
- API/schema/contract changes, if any

### 3a. Data Model Changes
*(Include only if the plan adds, modifies, or removes persisted data structures — DB schemas, ORM models, API payloads, config shapes, etc. Omit entirely if not applicable — do not include it as "N/A".)*

- **Entities affected**: list tables/models/types being changed (e.g. `User`, `orders` table, `AuthConfig` interface)
- **Schema diff**: old shape → new shape, field by field
  - New fields (name, type, nullable/default)
  - Removed fields (and what depends on them)
  - Changed fields (type changes, renames, constraint changes)
- **Migration strategy**:
  - Is this a breaking change to existing data?
  - Migration script needed? (up/down)
  - Backfill required for existing records?
  - Can this be deployed without downtime?
- **Serialization/API impact**: does this change request/response shapes, GraphQL schema, or public types?
- **Consumers affected**: list other modules/services that read or write this data and may need updates

### 3b. Implementation Rules

All implementation steps in this plan must follow a strict Red-Green-Refactor TDD cycle. Break the "Proposed Design" into the smallest reasonable increments, and for each increment:

1. **Red** — write a test that captures the new/changed behavior *before* writing any implementation code. The test must fail for the right reason (missing behavior, not a typo or import error).
2. **Confirm failure** — run just that test and read the failure output. Do not proceed on assumption; verify it fails.
3. **Green** — write the minimum implementation code needed to make the test pass. Avoid solving future increments early.
4. **Confirm pass** — run the test (and the surrounding suite) to verify it passes and nothing else broke.
5. **Refactor** — clean up naming, structure, and duplication with the safety net of the passing test(s). Re-run tests after refactoring.

Repeat per increment rather than writing a batch of implementation and tests together at the end.

**Backend (`core`, `api`, `worker`, `gateway`)**
- Every increment touching `core/` gets a corresponding test in `backend/core/tests/` (`test_database.py`, `test_file_processor.py`, `test_grading_agent.py`, `test_grading_task.py`, or `test_grading_queue.py` as appropriate — add a new test module only if none of these fit).
- Run cycles with `uv run --package inkgrader-core pytest` from `backend/core/`; scope to the single new/changed test during Red/Green (`pytest path::test_name`), then run the full package suite before moving to the next increment.
- Concurrency-sensitive changes (queue claiming, advisory locks, `asyncio.gather` fan-out) must have a test that would fail under a race before the fix is written, not just a happy-path test after.
- `api`, `worker`, `gateway` have no dedicated test suites listed in this doc — if an increment touches them directly (not via `core`), add a minimal test alongside the change and note the new test location in this plan; don't skip Red-Green silently because "there's no existing suite."

**Frontend**
- No test runner is configured (no jest/vitest in `package.json`). TDD as specified above cannot apply as-is.
- Any implementation step touching `frontend/` must either:
  (a) be scoped as a **non-goal** for automated testing and called out explicitly as manually-verified only, or
  (b) include a prerequisite increment to add a minimal test runner before the Red step — decide which and state it in Section 1 (Non-goals) rather than leaving it implicit.

**Plan-writing implication**
- The "Proposed Design" section should decompose work into an ordered list of Red-Green-Refactor increments (not just a feature description), so this section and Section 3 stay consistent — each design component should map to at least one visible test-first increment.

### 4. Alternatives Considered
*(Include only if there was a genuine fork in approach worth recording — e.g. multiple viable architectures, a tradeoff between performance/simplicity/compatibility, or a non-obvious choice a reviewer would ask "why not X?" about. Omit entirely for small, mechanical, or single-obvious-approach changes — do not include it as "N/A" or pad it with a strawman.)*

- The alternative approach(es)