CREATE TABLE
  projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

ALTER TABLE documents
ADD COLUMN project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE;

CREATE INDEX idx_documents_project_id ON documents (project_id);