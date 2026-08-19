import { useQueries } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { Badge, DocumentEditor, Dropdown } from "@/components";
import { documentQueryOptions, documentVersionsQueryOptions } from "@/utils/queries";

const routeApi = getRouteApi("/document/$id");

export function DocumentRoute() {
  const { id } = routeApi.useParams();

  const [{ data: document, isLoadingError }, { data: documentVersions = [] }] = useQueries({
    queries: [documentQueryOptions(id), documentVersionsQueryOptions(id)],
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        {document?.title ? (
          <div className="flex items-center justify-between gap-2">
            {document?.title ? <h1 className="font-display text-4xl font-medium tracking-tight">{document.title}</h1> : null}
          </div>
        ) : null}
        {isLoadingError ? <Badge size="xs" title="Failed to load" variant="error" /> : null}
        <Dropdown
          options={documentVersions.map((doc) => ({ id: doc.id, onClick: () => {}, title: `Version ${doc.versionNumber}` }))}>
          <div className="icon-[ph--clock-counter-clockwise] size-8" />
        </Dropdown>
      </div>
      {document ? <DocumentEditor documentId={id} initialContent={document.content} /> : null}
    </div>
  );
}
