import { queryOptions } from "@tanstack/react-query";

import { API } from "@/utils/api";

export function documentQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.getDocument(id),
    queryKey: ["documents", id],
  });
}

export function documentVersionsQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.listDocumentVersions(id),
    queryKey: ["documentVersions", id],
  });
}
