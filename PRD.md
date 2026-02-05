Коротко (TL;DR)

Life Dashboard → модульна система сторінок + праворуч — Widgets Area. Study Dashboard — окрема сторінка з власною логікою у своїй папці. Desktop: Electron + Next.js (App Router) + TypeScript. Єдиний DB: SQLite (better-sqlite3). ЛОКАЛЬНІ LLM (≤8B) через llama.cpp/ggml або інші рунери; вбудований LLM runner у Node (IPC між Electron main ↔ Next API). Vector DB локально — Qdrant / Faiss (локальний інстанс). Memory = embeddings + metadata у SQLite + vector index. Sandbox виконання коду — WASM для JS/Python або Docker локально (обрано локально). Widgets — декларативний реєстр + lifecycle events. ПДР — нижче.

1. Глобальна архітектура (конкретно)

Компоненти:

Electron shell (main process) — packaging, IPC, native FS, native window, process manager для LLM.

Next.js app (renderer) — UI сторінки, WidgetsArea, pages. Розгорнутий всередині Electron WebContents.

Local API (Next.js API routes + IPC proxies) — для LLM, sandbox, fs, sqlite.

LLM Runner (child process / native binary) — llama.cpp / ggml / llama.cpp-wasm в залежності від платформи.

SQLite (better-sqlite3) — основні таблиці, метадані, нотатки (.md paths).

Vector index — Qdrant (embedded) або Faiss (local). Pointer в SQLite.

Sandbox runner — WASM for JS/Python (prefer) або локальний контейнер manager (опціонально).

Browser-like automation (локальний executor) — для автозаповнення/скриптів (виконує користувач).

Assets folder — notes/*.md, projects/*, books/*.

Діаграма (словесно): Electron main ↔ IPC ↔ Next API ↔ UI. Next API ↔ LLM Runner (child process) ↔ vector index.

2. Модульна структура проекту (файлово)

(Ти вже маєш приклад; даю деталізовано)

/app
  /apps
    /desktop
      /app (Next App Router)
        /study/                 # сторінка Study Dashboard
        /main/
        /layout.tsx
      /electron/
        main.ts                 # electron main process
        ipc-handlers.ts
      /llm/
        runner/                 # код запуску локальних LLM
        models/
  /shared
    /widgets/
      /PomodoroWidget/
        index.tsx
        manifest.ts
      /ActivityWidget/
    /services/
      db.ts
      llmClient.ts
      memory.ts
      sandbox.ts
    /types/
      index.ts
  /notes
  package.json

3. Контракти між модулями (IPC / API) — імена каналів і payload

IPC канали (Electron main ↔ renderer):

ipc/llm/query — { requestId, prompt, context, model, params } → відповідає { requestId, stream?:..., result }

ipc/llm/status — статус локального рушія

ipc/fs/readFile — { path } → { content }

ipc/db/query — generic (use prepared statements)

ipc/sandbox/run — { language, code, timeout, resources } → { success, stdout, stderr, exitCode }

ipc/vector/search — { queryText, topK } → { hits: [{id, score, metadata}] }

ipc/agent/event — realtime events from UI to agent (editor changes, test failure etc.)

Next API routes (internal, same process):

POST /api/llm — wrapper for queries (used by Next UI code)

POST /api/memory/ingest

POST /api/sessions/start

POST /api/sessions/finish

GET /api/exports/report.md?from=&to=

4. SQLite схема (конкретні CREATE TABLE)
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- local single user: 'local'
  name TEXT
);

CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  metadata JSON
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  title TEXT,
  content_md_path TEXT,
  est_minutes INTEGER,
  skill_tag TEXT,
  created_at INTEGER
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT,
  started_at INTEGER,
  ended_at INTEGER,
  score REAL,
  metrics JSON
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT,
  path TEXT,
  metadata JSON
);

CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  type TEXT,           -- "preference"/"mistake"/"note"
  summary TEXT,
  vector_id TEXT,      -- pointer to vector index
  metadata JSON,
  created_at INTEGER,
  expires_at INTEGER
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT,
  file_path TEXT,
  created_at INTEGER
);

5. Memory & Embeddings pipeline (локально)

Ingest (book/pdf/notes/snippet) → chunking: 250–600 tokens per chunk, keep overlap 50–100 tokens.

Embed chunks with local encoder (sentence-transformers converted to ggml or use Open Source encoder) → vector.

Store vector in local vector index (Qdrant/Faiss). Save metadata + pointer in memories table.

Retriever: hybrid search — first BM25 (SQLite FTS5) for speed, then rerank by vector similarity.

RAG: pass top k chunks into LLM prompt, include memory summary and session short-term buffer.

Retention policy: keep all memories by default; auto-expiry for session buffers after 7 days unless flagged as long_term.

6. LLM runner — як реалізувати локально

Абстракція LLMClient (TS) з методами generate(prompt, opts) та stream(prompt, onToken).

Concrete runners:

LlamaCppRunner — запускає llama.cpp/ggml binary via child_process or native binding.

RemoteProxyRunner — для openrouter/groq endpoints (use as fallback).

Model files зберігаються у app/apps/desktop/llm/models/.

Контролер моделей у Electron main process: слідкує за пам'яттю, використовує swap/spawn, надає status.

Безпечні опції:

Max tokens, max threads, mem limit.

Option to pin model to GPU if available.

7. Sandbox виконання коду (локально)

Для JS/TS: run in isolated VM (Node vm2) or WASM (Deno/WASI) — рекомендується WASM for safety.

Для Python: use Pyodide (WASM) or local ephemeral venv with strict resource/time limits.

Contract: ipc/sandbox/run accepts {language, code, input, timeoutMs}, returns {stdout, stderr, exitCode, logs}.

For heavier tasks: prompt user to allow local Docker run (explicit consent).

8. Agent Skills — список, опис, сигнатури

Skill contract: {skillName, inputSchema, allowedTools}.

Примірні скіли:

code_explain — input: { filePath?, codeSnippet, cursorPos? } → tools: memory, sandbox (optional). Output: explanation + suggested refactor + tests.

debug_helper — input: { errorStack, codeSnapshot } → tools: sandbox runner → output: patch suggestion.

plan_generator — input: { goal, timeAvailableMinutes, skillTag } → output: lesson plan (JSON steps).

replicube_assist — input: { targetShape, currentState } → output: step list, optimizations.

Викликаються через POST /api/agent/query або ipc/agent/event.

9. Session lifecycle (повний flow)

User opens lesson → POST /api/sessions/start → creates session row, short-term buffer created (in memory).

Pre-lesson plan: Agent generates plan using memory + goals (plan_generator).

During lesson:

Events: code edits, test runs, builder actions emitted to ipc/agent/event.

Timer widget interacts with session start/pause/resume calls.

Agent offers hints when heuristics detect stuck state (no edits for X minutes & failing tests).

User finishes → POST /api/sessions/finish with metrics. Triggers background analysis worker.

Analysis worker:

Compute metrics: total_time, productive_time, attempts_count, error_types.

Update memory: create memory entries for recurring mistakes.

Update mastery model: use Ebbinghaus/Spaced Repetition scoring or Bayesian estimate (formula below).

Produce suggested next lesson plan; store as draft.

User gets report: GET /api/sessions/:id/report.md (export ready).

Mastery scoring idea (concrete):

P_master_new = sigmoid( w1*success_rate + w2*log(total_time+1) - w3*error_count )


Tune weights empirically.

10. Widgets API (жорсткі правила / контракт)

Кожен віджет повинен мати:

manifest.ts:

export interface WidgetManifest {
  key: string;
  title: string;
  minWidth?: number;
  minHeight?: number;
  priority?: number;
  eventsHandled?: string[]; // ['session:start','timer:tick','session:finish']
}


Lifecycle methods:

onMount(context)

onEvent(eventName, payload) — widgets decide self, can request "promote" via WidgetsArea.

onUnmount()

WidgetsArea:

Рендерить widgets за keys, отриманими зі сторінки.

Проксить global events (session:start, editor:change, timer:tick) до кожного віджету.

Promotion logic:

Widget emits promoteWidget(widgetKey, reason, level) to raise visibility.

11. PDR — Product Design Requirements (конкретні правила для реалізації)
11.1 Загальні принципи

Модульність: логіка кожної сторінки в своїй папці. Widgets — окремі малі пакети.

Single Source of Truth: SQLite store + in-memory cache; no Redux.

Minimal deps: мінімум великих бібліотек; використовувати only React, Next, shadcn/ui, three.js.

Local-first: усі операції мають працювати офлайн (за винятком optional remote LLM fallback).

Explicit permissions: всі дії що мають side-effects (run code, access FS, network) — потребують явного дозволу.

11.2 UI rules

Two UI targets: Desktop (Electron + Next) & Mobile (Expo) — share TS types and services.

Layout: Left nav (pages), center content, right widgets area fixed.

Widgets responsive vertically; each widget max height 320px, min 80px.

Lesson player: left column — plan + theory; center — practice (editor/canvas); right — agent chat + widgets.

Accessibility: keyboard navigation for editor, high contrast mode toggle, font-size scaling.

Theme: light/dark; use CSS variables; respect system preference.

11.3 UX rules

Before lesson: show generated plan with explicit steps and estimated time; allow user to modify.

During lesson: unobtrusive agent hints; no forced auto-run.

After lesson: present concise report (top 3 insights) + detailed export.

Timer: Pomodoro mode by default (25/5), ability to set custom.

11.4 Data & Privacy

All user data stored locally by default.

Provide UI to export/delete entire memory.

Local backup: export DB + notes as tar.gz.

No telemetry unless user opt-in.

11.5 Performance

UI interactions <50ms for widget toggles.

LLM tasks run in background; show progress and do not block UI.

Vector search <200ms for topK (on typical local dataset <50k chunks).

12. Testing strategy & quality

Unit tests for services (db, memory, llmClient) with jest.

E2E tests with Playwright on Next UI inside Electron (headless).

Fuzz tests for sandbox runner (malicious code patterns).

Regression tests for session analysis worker.

13. MVP (конкретні спринти)

Sprint 0 — infra & skeleton

Electron main + Next app in mono-repo

SQLite integration + basic pages + left nav + widgets area
Sprint 1 — Study core

Lessons CRUD, lesson player, Monaco editor, session start/finish, Pomodoro widget
Sprint 2 — Sandbox + LLM baseline

Local WASM runner for JS, basic LLM runner + local small model (test)
Sprint 3 — Memory + analysis

Chunking + embedding pipeline (local encoder), vector index local, session analysis worker, report export
Sprint 4 — Agent skills & extension

code_explain, debug_helper, replicube basic canvas (Three.js)

14. Concrete TypeScript interfaces (без пропусків)
// shared/types/index.ts
export type ID = string;
export interface Lesson {
  id: ID;
  courseId?: ID;
  title: string;
  contentMdPath: string;
  estMinutes: number;
  skillTag?: string;
  createdAt: number;
}

export interface Session {
  id: ID;
  lessonId: ID;
  startedAt: number;
  endedAt?: number;
  score?: number;
  metrics?: Record<string, any>;
}

export interface MemoryEntry {
  id: ID;
  type: 'preference' | 'mistake' | 'note';
  summary: string;
  vectorId?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  expiresAt?: number;
}

export interface WidgetManifest {
  key: string;
  title: string;
  minWidth?: number;
  minHeight?: number;
  eventsHandled?: string[];
}

15. Security & privacy concrete checklist

All code executed in sandbox with timeouts and CPU/mem limits.

LLM files stored in app sandboxed folder; downloads only on user confirmation.

No remote call unless user allows (OpenRouter fallback opt-in).

Provide single-click: export all data & delete all (GDPR-like).

16. Example: Post-session analysis algorithm (concrete steps)

Aggregate raw metrics: attempts, failingTests, timeSpentOnTests, idlePeriods.

Categorize errors by regex patterns (syntax, async, API misuse).

Compute productivity = productive_time / total_time.

Compute masteryScore_skill using logistic regression over features:

success_rate, attempts_count, time_spent, error_severity.

Generate recommendations: if masteryScore < 0.6 → schedule two micro-lessons on weaknesses.

Store 'mistake' memories: if error pattern repeats in >=2 sessions → persist.

17. Deliverables — що я можу зробити далі прямо зараз

Вибери одну з опцій (відповідай просто «1», «2» або «3»):

Згенерувати ER-діаграму + sequence diagram у PlantUML (готову до вставки у README).

Згенерувати repo skeleton (package.json, Next/Electron boilerplate, базові сервісні файли, sqlite init) у вигляді дерева + ключові файли (можу віддати як zip).

Зробити UI-прототип сторінки Study (React + Tailwind + shadcn components) — компонент LessonPlayer + WidgetsArea + PomodoroWidget (код готовий до вставки).

18. Швидкі відповіді на очевидні технічні рішення (чому саме)

SQLite — простий, portable, достатній для локального десктопу.

Qdrant/Faiss — легкий локальний vector search для персональної memory.

llama.cpp/ggml — дозволяє використовувати місцеві моделі ≤8B.

WASM runners — безпечніше за локальний Node кінець-в-кінець для виконання коду.
