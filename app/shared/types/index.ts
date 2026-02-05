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
  metrics?: Record<string, unknown>;
}

export interface MemoryEntry {
  id: ID;
  type: "preference" | "mistake" | "note";
  summary: string;
  vectorId?: string;
  metadata?: Record<string, unknown>;
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
