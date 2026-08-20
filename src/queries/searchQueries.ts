import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { API } from "@/api";

export function searchQueryOptions(q: string) {
  return queryOptions({
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
    queryFn: () => API.search.search(q),
    queryKey: ["search", q],
  });
}
