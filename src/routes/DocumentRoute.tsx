import { useQueries } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { Badge, DocumentEditor, Dropdown } from "@/components";
import { parseContent } from "@/utils/document";
import { documentQueryOptions, documentVersionQueryOptions, documentVersionsQueryOptions } from "@/utils/queries";

const routeApi = getRouteApi("/document/$id/$versionNumber");

export function DocumentRoute() {
  const { id, versionNumber } = routeApi.useParams();
  const navigate = useNavigate();

  const [
    { data: document, isLoadingError },
    { data: documentVersions = [] },
    { data: documentVersion, isLoading: isLoadingDocumentVersion },
  ] = useQueries({
    queries: [
      documentQueryOptions(id),
      documentVersionsQueryOptions(id),
      versionNumber
        ? documentVersionQueryOptions(id, versionNumber)
        : { enabled: false, queryFn: () => undefined, queryKey: ["documentVersion", id, versionNumber] },
    ],
  });

  //TODO: Skeleton component
  if (isLoadingDocumentVersion) return null;

  const content = parseContent(documentVersion?.content);

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
          options={documentVersions.map((doc) => ({
            id: doc.id,
            onClick: () =>
              navigate({ params: { id, versionNumber: doc.versionNumber.toString() }, to: "/document/$id/$versionNumber" }),
            title: `Version ${doc.versionNumber}`,
          }))}>
          <div className="icon-[ph--clock-counter-clockwise] size-8" />
        </Dropdown>
      </div>
      {document ? <DocumentEditor documentId={id} initialContent={content} versionNumber={versionNumber} /> : null}
    </div>
  );
}
