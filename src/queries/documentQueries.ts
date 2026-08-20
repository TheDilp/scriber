import { queryOptions } from "@tanstack/react-query";

import { API } from "@/api";

export function documentQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.documents.get(id),
    queryKey: ["documents", id],
  });
}
