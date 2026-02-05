export type IpcChannel =
  | "ipc/llm/query"
  | "ipc/llm/status"
  | "ipc/fs/readFile"
  | "ipc/db/query"
  | "ipc/sandbox/run"
  | "ipc/vector/search"
  | "ipc/agent/event";

export interface LlmQueryPayload {
  requestId: string;
  prompt: string;
  context?: string;
  model?: string;
  params?: Record<string, unknown>;
}

export interface LlmQueryResponse {
  requestId: string;
  stream?: string;
  result?: string;
}

export interface FsReadFilePayload {
  path: string;
}

export interface FsReadFileResponse {
  content: string;
}

export interface SandboxRunPayload {
  language: "js" | "ts" | "python";
  code: string;
  input?: string;
  timeoutMs?: number;
  resources?: Record<string, unknown>;
}

export interface SandboxRunResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  logs?: string[];
}

export interface VectorSearchPayload {
  queryText: string;
  topK: number;
}

export interface VectorSearchHit {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorSearchResponse {
  hits: VectorSearchHit[];
}
