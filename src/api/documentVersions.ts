import type { DocumentVersion } from "@/types";

import { request } from "./request";

async function list(documentId: string): Promise<DocumentVersion[]> {
  return request<DocumentVersion[]>(`/api/v1/documents/${documentId}/versions`);
}

async function get(documentId: string, versionId: string): Promise<DocumentVersion> {
  return request<DocumentVersion>(`/api/v1/documents/${documentId}/versions/${versionId}`);
}

async function create(documentId: string, content: unknown): Promise<DocumentVersion> {
  return request<DocumentVersion>(`/api/v1/documents/${documentId}/versions`, {
    body: JSON.stringify({ content: JSON.stringify(content) }),
    method: "POST",
  });
}

async function update(documentId: string, versionId: string, content: unknown): Promise<DocumentVersion> {
  return request<DocumentVersion>(`/api/v1/documents/${documentId}/versions/${versionId}`, {
    body: JSON.stringify({ content: JSON.stringify(content) }),
    method: "PUT",
  });
}

async function remove(documentId: string, versionId: string): Promise<void> {
  await request<null>(`/api/v1/documents/${documentId}/versions/${versionId}`, { method: "DELETE" });
}

export const documentVersionApi = { create, get, list, remove, update };
