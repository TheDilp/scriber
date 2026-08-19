import type { NodeJSON } from "prosekit/core";

export type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export type Document = {
  content: NodeJSON | undefined;
  createdAt: string;
  id: string;
  title: string;
  updatedAt: string;
};

type ApiDocumentSummary = {
  id: string;
  title: string;
  updated_at: string;
};

type ApiDocument = {
  content: string;
  created_at: string;
  id: string;
  title: string;
  updated_at: string;
};

export type DocumentVersion = {
  content: NodeJSON | undefined;
  createdAt: string;
  documentId: string;
  id: string;
  versionNumber: number;
};

type ApiDocumentVersion = {
  content: string;
  created_at: string;
  document_id: string;
  id: string;
  version_number: number;
};

function parseContent(content: string): NodeJSON | undefined {
  if (!content) return undefined;
  return JSON.parse(content);
}

function toDocument(doc: ApiDocument): Document {
  return {
    content: parseContent(doc.content),
    createdAt: doc.created_at,
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updated_at,
  };
}

function toSummary(doc: ApiDocumentSummary): DocumentSummary {
  return { id: doc.id, title: doc.title, updatedAt: doc.updated_at };
}

function toDocumentVersion(version: ApiDocumentVersion): DocumentVersion {
  return {
    content: parseContent(version.content),
    createdAt: version.created_at,
    documentId: version.document_id,
    id: version.id,
    versionNumber: version.version_number,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) throw new Error(`Request to ${path} failed with status ${response.status}`);

  return response.json() as Promise<T>;
}

async function listDocuments(): Promise<DocumentSummary[]> {
  const docs = await request<ApiDocumentSummary[]>("/api/v1/documents");
  return docs.map(toSummary);
}

async function createDocument(title: string): Promise<string> {
  const docId = await request<string>("/api/v1/documents", {
    body: JSON.stringify({ title }),
    method: "POST",
  });
  return docId;
}

async function getDocument(id: string): Promise<Document> {
  const doc = await request<ApiDocument>(`/api/v1/documents/${id}`);
  return toDocument(doc);
}

async function saveDocument(id: string, patch: { content?: unknown; title?: string }): Promise<Document> {
  const doc = await request<ApiDocument>(`/api/v1/documents/${id}`, {
    body: JSON.stringify({
      content: patch.content === undefined ? undefined : JSON.stringify(patch.content),
      title: patch.title,
    }),
    method: "PUT",
  });
  return toDocument(doc);
}

async function listDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const versions = await request<ApiDocumentVersion[]>(`/api/v1/documents/${documentId}/versions`);
  return versions.map(toDocumentVersion);
}

async function getDocumentVersion(documentId: string, versionId: string): Promise<DocumentVersion> {
  const version = await request<ApiDocumentVersion>(`/api/v1/documents/${documentId}/versions/${versionId}`);
  return toDocumentVersion(version);
}

async function createDocumentVersion(documentId: string, content: unknown): Promise<DocumentVersion> {
  const version = await request<ApiDocumentVersion>(`/api/v1/documents/${documentId}/versions`, {
    body: JSON.stringify({ content: JSON.stringify(content) }),
    method: "POST",
  });
  return toDocumentVersion(version);
}

async function updateDocumentVersion(documentId: string, versionId: string, content: unknown): Promise<DocumentVersion> {
  const version = await request<ApiDocumentVersion>(`/api/v1/documents/${documentId}/versions/${versionId}`, {
    body: JSON.stringify({ content: JSON.stringify(content) }),
    method: "PUT",
  });
  return toDocumentVersion(version);
}

async function deleteDocumentVersion(documentId: string, versionId: string): Promise<void> {
  await request<null>(`/api/v1/documents/${documentId}/versions/${versionId}`, { method: "DELETE" });
}

export const API = {
  createDocument,
  createDocumentVersion,
  deleteDocumentVersion,
  getDocument,
  getDocumentVersion,
  listDocuments,
  listDocumentVersions,
  saveDocument,
  updateDocumentVersion,
};
