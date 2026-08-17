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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) throw new Error(`Request to ${path} failed with status ${response.status}`);

  return response.json() as Promise<T>;
}

export async function listDocuments(): Promise<DocumentSummary[]> {
  const docs = await request<ApiDocumentSummary[]>("/api/v1/documents");
  return docs.map(toSummary);
}

export async function createDocument(title?: string): Promise<Document> {
  const doc = await request<ApiDocument>("/api/v1/documents", {
    body: JSON.stringify({ title }),
    method: "POST",
  });
  return toDocument(doc);
}

export async function getDocument(id: string): Promise<Document> {
  const doc = await request<ApiDocument>(`/api/v1/documents/${id}`);
  return toDocument(doc);
}

export async function saveDocument(id: string, patch: { content?: unknown; title?: string }): Promise<Document> {
  const doc = await request<ApiDocument>(`/api/v1/documents/${id}`, {
    body: JSON.stringify({
      content: patch.content === undefined ? undefined : JSON.stringify(patch.content),
      title: patch.title,
    }),
    method: "PUT",
  });
  return toDocument(doc);
}
