CREATE TABLE
  document_aliases (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (document_id, title)
  );

CREATE INDEX idx_document_aliases_document_id ON document_aliases (document_id);
