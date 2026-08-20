import type { DocumentAlias } from "@/types";

import { request } from "./request";

async function listByDocument(documentId: string): Promise<DocumentAlias[]> {
  return request<DocumentAlias[]>(`/api/v1/documents/${documentId}/aliases`);
}

async function createForDocument(documentId: string, title: string): Promise<DocumentAlias> {
  return request<DocumentAlias>(`/api/v1/documents/${documentId}/aliases`, {
    body: JSON.stringify({ title }),
    method: "POST",
  });
}

async function removeFromDocument(documentId: string, aliasId: string): Promise<void> {
  await request<null>(`/api/v1/documents/${documentId}/aliases/${aliasId}`, { method: "DELETE" });
}

export const aliasApi = { createForDocument, listByDocument, removeFromDocument };
