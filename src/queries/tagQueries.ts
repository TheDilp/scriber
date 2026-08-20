import { queryOptions } from "@tanstack/react-query";

import { API } from "@/api";

export function documentTagsQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.tags.listByDocument(id),
    queryKey: ["documentTags", id],
  });
}
