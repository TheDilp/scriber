import { queryOptions } from "@tanstack/react-query";

import { API } from "@/api";

export function documentAliasesQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => API.aliases.listByDocument(id),
    queryKey: ["documentAliases", id],
  });
}
