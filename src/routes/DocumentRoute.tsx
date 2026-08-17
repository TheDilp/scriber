import { getRouteApi } from "@tanstack/react-router";

import { DocumentEditor } from "@/components";

const routeApi = getRouteApi("/document/$id");

export function DocumentRoute() {
  const { id } = routeApi.useParams();
  return (
    <div className="p-4">
      <DocumentEditor documentId={id} />
    </div>
  );
}
