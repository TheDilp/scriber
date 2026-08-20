import type { DocumentSummary } from "@/types";

import { request } from "./request";

async function search(q: string): Promise<DocumentSummary[]> {
  return request<DocumentSummary[]>(`/api/v1/search?q=${encodeURIComponent(q)}`);
}

export const searchApi = { search };
