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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) throw new Error(`Request to ${path} failed with status ${response.status}`);

  return response.json() as Promise<T>;
}

async function listDocuments(): Promise<DocumentSummary[]> {
  return request<DocumentSummary[]>("/api/v1/documents");
}

async function createDocument(title: string): Promise<string> {
  const docId = await request<string>("/api/v1/documents", {
    body: JSON.stringify({ title }),
    method: "POST",
  });
  return docId;
}

async function getDocument(id: string): Promise<Document> {
  return request<Document>(`/api/v1/documents/${id}`);
}

async function updateDocument(id: string, patch: { title?: string }): Promise<string> {
  return await request<string>(`/api/v1/documents/${id}`, {
    body: JSON.stringify({ title: patch.title }),
    method: "PUT",
  });
}

async function listDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  return await request<DocumentVersion[]>(`/api/v1/documents/${documentId}/versions`);
}

async function getDocumentVersion(documentId: string, versionId: string): Promise<DocumentVersion> {
  return await request<DocumentVersion>(`/api/v1/documents/${documentId}/versions/${versionId}`);
}

async function createDocumentVersion(documentId: string, content: unknown): Promise<DocumentVersion> {
  return await request<DocumentVersion>(`/api/v1/documents/${documentId}/versions`, {
    body: JSON.stringify({ content: JSON.stringify(content) }),
    method: "POST",
  });
}

async function updateDocumentVersion(documentId: string, versionId: string, content: unknown): Promise<DocumentVersion> {
  return await request<DocumentVersion>(`/api/v1/documents/${documentId}/versions/${versionId}`, {
    body: JSON.stringify({ content: JSON.stringify(content) }),
    method: "PUT",
  });
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
  updateDocument,
  updateDocumentVersion,
};
