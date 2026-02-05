# Global Architecture

This document captures the **first PRD milestone**: a concrete, shared view of the system's global architecture and component responsibilities.

## Components

- **Electron shell (main process)**
  - Packaging, native window lifecycle, IPC routing, file system access, and LLM process management.
- **Next.js app (renderer)**
  - UI layer for pages, widgets area, and app navigation.
- **Local API (Next.js API routes + IPC proxies)**
  - Internal API endpoints for LLM, sandbox, filesystem, and SQLite access.
- **LLM Runner (child process / native binary)**
  - Executes local models via `llama.cpp`/`ggml` (or WASM fallback), controlled by Electron.
- **SQLite (better-sqlite3)**
  - Single source of truth for user data and metadata.
- **Vector index (Qdrant or Faiss)**
  - Local vector search index; pointers stored in SQLite.
- **Sandbox runner**
  - Isolated code execution with resource limits, preferring WASM runtimes.
- **Browser-like automation**
  - Local executor for scripted automation, gated by user consent.
- **Assets folder**
  - Local markdown notes and project content (`notes/`, `projects/`, `books/`).

## High-level data flow

Electron main ↔ IPC ↔ Next.js API ↔ UI.

Next.js API ↔ LLM Runner (child process) ↔ Vector index.

## Module ownership boundaries

- **Electron main** owns:
  - LLM runner lifecycle and system-level permissions.
  - IPC gateways for filesystem and sandbox.
- **Next.js UI** owns:
  - Page routing and layout composition.
  - Widgets area orchestration and event distribution.
- **Shared services** own:
  - SQLite schema, DB access, and vector index integration.
  - Strongly typed contracts exposed to UI and IPC handlers.

## Architecture diagram (text)

```
[Electron main]
      ↕ IPC
[Next.js API routes]
      ↕
[Next.js UI]
      ↕
[Widgets + Pages]

[Next.js API routes] ↔ [LLM Runner]
[Next.js API routes] ↔ [SQLite]
[Next.js API routes] ↔ [Vector Index]
[Next.js API routes] ↔ [Sandbox Runner]
```

## Follow-up milestones

1. Project skeleton (Electron + Next.js + SQLite bootstrap).
2. Study Dashboard page module with right-side widgets area.
3. IPC contracts and local API surface for LLM/memory/sandbox.
