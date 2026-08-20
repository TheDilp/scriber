CREATE VIRTUAL TABLE document_search USING fts5(
  document_id UNINDEXED,
  title,
  aliases,
  content,
  tokenize = 'trigram'
);

INSERT INTO document_search (document_id, title, aliases, content)
SELECT
  d.id,
  d.title,
  COALESCE(
    (
      SELECT group_concat(da.title, ' ')
      FROM document_aliases da
      WHERE da.document_id = d.id
    ),
    ''
  ),
  COALESCE(
    (
      SELECT dv.content
      FROM document_versions dv
      WHERE dv.document_id = d.id
      ORDER BY dv.version_number DESC
      LIMIT 1
    ),
    ''
  )
FROM documents d;

CREATE TRIGGER document_search_after_document_insert
AFTER INSERT ON documents
BEGIN
  INSERT INTO document_search (document_id, title, aliases, content)
  VALUES (NEW.id, NEW.title, '', '');
END;

CREATE TRIGGER document_search_after_document_title_update
AFTER UPDATE OF title ON documents
BEGIN
  UPDATE document_search
  SET title = NEW.title
  WHERE document_id = NEW.id;
END;

CREATE TRIGGER document_search_before_document_delete
BEFORE DELETE ON documents
BEGIN
  DELETE FROM document_search WHERE document_id = OLD.id;
END;

CREATE TRIGGER document_search_after_version_insert
AFTER INSERT ON document_versions
WHEN NEW.version_number = (
  SELECT MAX(version_number)
  FROM document_versions
  WHERE document_id = NEW.document_id
)
BEGIN
  UPDATE document_search
  SET content = NEW.content
  WHERE document_id = NEW.document_id;
END;

CREATE TRIGGER document_search_after_current_version_update
AFTER UPDATE OF content ON document_versions
WHEN NEW.version_number = (
  SELECT MAX(version_number)
  FROM document_versions
  WHERE document_id = NEW.document_id
)
BEGIN
  UPDATE document_search
  SET content = NEW.content
  WHERE document_id = NEW.document_id;
END;

CREATE TRIGGER document_search_after_version_delete
AFTER DELETE ON document_versions
BEGIN
  UPDATE document_search
  SET content = COALESCE(
    (
      SELECT content
      FROM document_versions
      WHERE document_id = OLD.document_id
      ORDER BY version_number DESC
      LIMIT 1
    ),
    ''
  )
  WHERE document_id = OLD.document_id;
END;

CREATE TRIGGER document_search_after_alias_insert
AFTER INSERT ON document_aliases
BEGIN
  UPDATE document_search
  SET aliases = COALESCE(
    (
      SELECT group_concat(title, ' ')
      FROM document_aliases
      WHERE document_id = NEW.document_id
    ),
    ''
  )
  WHERE document_id = NEW.document_id;
END;

CREATE TRIGGER document_search_after_alias_title_update
AFTER UPDATE OF title ON document_aliases
BEGIN
  UPDATE document_search
  SET aliases = COALESCE(
    (
      SELECT group_concat(title, ' ')
      FROM document_aliases
      WHERE document_id = NEW.document_id
    ),
    ''
  )
  WHERE document_id = NEW.document_id;
END;

CREATE TRIGGER document_search_after_alias_delete
AFTER DELETE ON document_aliases
BEGIN
  UPDATE document_search
  SET aliases = COALESCE(
    (
      SELECT group_concat(title, ' ')
      FROM document_aliases
      WHERE document_id = OLD.document_id
    ),
    ''
  )
  WHERE document_id = OLD.document_id;
END;
