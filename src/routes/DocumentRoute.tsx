import type { NodeJSON } from "prosekit/core";

import { useMutation, useQueries } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { Badge, DocumentEditor, Dropdown } from "@/components";
import { API } from "@/utils/api";
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

  const {
    isError: isSaveError,
    isPending: isSaving,
    isSuccess: isSaved,
    mutate: save,
  } = useMutation({
    mutationFn: (content: NodeJSON) => API.updateDocumentVersion(id, versionNumber, content),
  });

  //TODO: Skeleton component
  if (isLoadingDocumentVersion) return null;

  const content = parseContent(documentVersion?.content);

  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        {document?.title ? (
          <div className="mr-auto flex items-center justify-between gap-2">
            {document?.title ? <h1 className="font-display text-4xl font-medium tracking-tight">{document.title}</h1> : null}
          </div>
        ) : null}
        {isLoadingError ? <Badge size="xs" title="Failed to load" variant="error" /> : null}
        {isSaved ? <Badge title="Saved" variant="success" /> : null}
        {isSaving ? <Badge title="Saving…" variant="info" /> : null}
        {isSaveError ? <Badge title="Save failed" variant="error" /> : null}
        <Dropdown
          options={documentVersions.map((doc) => ({
            id: doc.id,
            onClick: () =>
              navigate({ params: { id, versionNumber: doc.versionNumber.toString() }, to: "/document/$id/$versionNumber" }),
            title: `Version ${doc.versionNumber}`,
          }))}>
          <div className="icon-[ph--clock-counter-clockwise] size-6" />
        </Dropdown>
      </div>
      {document ? <DocumentEditor documentId={id} initialContent={content} save={save} versionNumber={versionNumber} /> : null}
    </div>
  );
}
