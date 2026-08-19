import { request } from "./request";

export type DocumentSummary = {
  currentVersion: number;
  id: string;
  title: string;
  updatedAt: string;
};

export type Document = {
  createdAt: string;
  currentVersion: number;
  id: string;
  title: string;
  updatedAt: string;
};

export type DocumentVersion = {
  content: string | undefined;
  createdAt: string;
  documentId: string;
  id: string;
  versionNumber: number;
};

async function list(): Promise<DocumentSummary[]> {
  return request<DocumentSummary[]>("/api/v1/documents");
}

async function create({ projectId, title }: { projectId: string; title: string }): Promise<string> {
  return request<string>("/api/v1/documents", {
    body: JSON.stringify({ projectId, title }),
    method: "POST",
  });
}

async function get(id: string): Promise<Document> {
  return request<Document>(`/api/v1/documents/${id}`);
}

async function update(id: string, patch: { title?: string }): Promise<string> {
  return request<string>(`/api/v1/documents/${id}`, {
    body: JSON.stringify({ title: patch.title }),
    method: "PUT",
  });
}

async function listVersions(documentId: string): Promise<DocumentVersion[]> {
  return request<DocumentVersion[]>(`/api/v1/documents/${documentId}/versions`);
}

async function getVersion(documentId: string, versionId: string): Promise<DocumentVersion> {
  return request<DocumentVersion>(`/api/v1/documents/${documentId}/versions/${versionId}`);
}

async function createVersion(documentId: string, content: unknown): Promise<DocumentVersion> {
  return request<DocumentVersion>(`/api/v1/documents/${documentId}/versions`, {
    body: JSON.stringify({ content: JSON.stringify(content) }),
    method: "POST",
  });
}

async function updateVersion(documentId: string, versionId: string, content: unknown): Promise<DocumentVersion> {
  return request<DocumentVersion>(`/api/v1/documents/${documentId}/versions/${versionId}`, {
    body: JSON.stringify({ content: JSON.stringify(content) }),
    method: "PUT",
  });
}

async function deleteVersion(documentId: string, versionId: string): Promise<void> {
  await request<null>(`/api/v1/documents/${documentId}/versions/${versionId}`, { method: "DELETE" });
}

export const documentApi = {
  create,
  createVersion,
  deleteVersion,
  get,
  getVersion,
  list,
  listVersions,
  update,
  updateVersion,
};
