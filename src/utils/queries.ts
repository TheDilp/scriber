import { queryOptions } from "@tanstack/react-query";

import { documentApi } from "@/api";

export function documentQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => documentApi.get(id),
    queryKey: ["documents", id],
  });
}

export function documentVersionsQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => documentApi.listVersions(id),
    queryKey: ["documentVersions", id],
  });
}

export function documentVersionQueryOptions(documentId: string, versionId: string) {
  return queryOptions({
    queryFn: () => documentApi.getVersion(documentId, versionId),
    queryKey: ["documentVersion", documentId, versionId],
  });
}
