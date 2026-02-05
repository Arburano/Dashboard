import type {
  IpcChannel,
  LlmQueryPayload,
  LlmQueryResponse,
  SandboxRunPayload,
  SandboxRunResponse,
  VectorSearchPayload,
  VectorSearchResponse,
} from "../../shared/types/ipc";

export const ipcChannels: IpcChannel[] = [
  "ipc/llm/query",
  "ipc/llm/status",
  "ipc/fs/readFile",
  "ipc/db/query",
  "ipc/sandbox/run",
  "ipc/vector/search",
  "ipc/agent/event",
];

export const ipcHandlers = {
  "ipc/llm/query": (payload: LlmQueryPayload): LlmQueryResponse => ({
    requestId: payload.requestId,
    result: "LLM runner not initialized",
  }),
  "ipc/sandbox/run": (_payload: SandboxRunPayload): SandboxRunResponse => ({
    success: false,
    stdout: "",
    stderr: "Sandbox runner not initialized",
    exitCode: 1,
  }),
  "ipc/vector/search": (_payload: VectorSearchPayload): VectorSearchResponse => ({
    hits: [],
  }),
} satisfies Partial<Record<IpcChannel, (...args: never[]) => unknown>>;
