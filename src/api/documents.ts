import type { Document, DocumentSummary } from "@/types";

import { request } from "./request";

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

export const documentApi = { create, get, list, update };
