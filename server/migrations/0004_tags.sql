CREATE TABLE
  tags (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (project_id, title)
  );

CREATE INDEX idx_tags_project_id ON tags (project_id);

CREATE TABLE
  document_tags (
    document_id TEXT NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (document_id, tag_id)
  );

CREATE INDEX idx_document_tags_tag_id ON document_tags (tag_id);