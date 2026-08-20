import type { Tag } from "@/types";

import { request } from "./request";

async function listByProject(projectId: string): Promise<Tag[]> {
  return request<Tag[]>(`/api/v1/projects/${projectId}/tags`);
}

async function listByDocument(documentId: string): Promise<Tag[]> {
  return request<Tag[]>(`/api/v1/documents/${documentId}/tags`);
}

async function createForDocument(documentId: string, title: string): Promise<Tag> {
  return request<Tag>(`/api/v1/documents/${documentId}/tags`, {
    body: JSON.stringify({ title }),
    method: "POST",
  });
}

async function removeFromProject(projectId: string, id: string): Promise<void> {
  await request<null>(`/api/v1/projects/${projectId}/tags/${id}`, { method: "DELETE" });
}

async function removeFromDocument(documentId: string, tagId: string): Promise<void> {
  await request<null>(`/api/v1/documents/${documentId}/tags/${tagId}`, { method: "DELETE" });
}

export const tagApi = { createForDocument, listByDocument, listByProject, removeFromDocument, removeFromProject };
