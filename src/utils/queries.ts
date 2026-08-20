import { queryOptions } from "@tanstack/react-query";

import { API } from "@/api";

export function documentQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.documents.get(id),
    queryKey: ["documents", id],
  });
}

export function documentAliasesQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.aliases.listByDocument(id),
    queryKey: ["documentAliases", id],
  });
}

export function documentTagsQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.tags.listByDocument(id),
    queryKey: ["documentTags", id],
  });
}

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
