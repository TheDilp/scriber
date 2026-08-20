import { queryOptions } from "@tanstack/react-query";

import { API } from "@/api";

export function documentVersionsQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.documentVersions.list(id),
    queryKey: ["documentVersions", id],
  });
}

export function documentVersionQueryOptions(documentId: string, versionId: string) {
  return queryOptions({
    queryFn: () => API.documentVersions.get(documentId, versionId),
    queryKey: ["documentVersion", documentId, versionId],
  });
}
