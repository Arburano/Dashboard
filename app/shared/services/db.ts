export const databaseConfig = {
  engine: "better-sqlite3",
  filename: "life-dashboard.db",
};

export const schemaSql = {
  users: `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT
  );`,
  courses: `CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    metadata JSON
  );`,
  lessons: `CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    title TEXT,
    content_md_path TEXT,
    est_minutes INTEGER,
    skill_tag TEXT,
    created_at INTEGER
  );`,
  sessions: `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    lesson_id TEXT,
    started_at INTEGER,
    ended_at INTEGER,
    score REAL,
    metrics JSON
  );`,
  projects: `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT,
    path TEXT,
    metadata JSON
  );`,
  memories: `CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    type TEXT,
    summary TEXT,
    vector_id TEXT,
    metadata JSON,
    created_at INTEGER,
    expires_at INTEGER
  );`,
  notes: `CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    file_path TEXT,
    created_at INTEGER
  );`,
};

export const orderedSchema = [
  schemaSql.users,
  schemaSql.courses,
  schemaSql.lessons,
  schemaSql.sessions,
  schemaSql.projects,
  schemaSql.memories,
  schemaSql.notes,
];

export function getSchemaSummary() {
  return Object.keys(schemaSql);
}
