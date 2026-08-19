import type { NodeJSON } from "prosekit/core";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Badge, DocumentEditor, Drawer } from "@/components";
import { API } from "@/utils/api";
import { parseContent } from "@/utils/document";
import { documentQueryOptions, documentVersionQueryOptions, documentVersionsQueryOptions } from "@/utils/queries";

const routeApi = getRouteApi("/document/$id/$versionNumber");

export function DocumentRoute() {
  const { id, versionNumber } = routeApi.useParams();
  const [isVersionsDrawerOpen, setIsVersionsDrawerOpen] = useState(false);
  const { data: versions = [] } = useQuery(documentVersionsQueryOptions(id));

  const [{ data: document, isLoadingError }, { data: documentVersion, isLoading: isLoadingDocumentVersion }] = useQueries({
    queries: [
      documentQueryOptions(id),
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
    <div className="flex h-full flex-col p-4">
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
        <button
          aria-controls="document-versions-title"
          aria-expanded={isVersionsDrawerOpen}
          aria-label="Open version history"
          className="text-secondary hover:bg-surface-raised hover:text-primary focus-visible:outline-accent rounded p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setIsVersionsDrawerOpen(true)}
          type="button">
          <span aria-hidden="true" className="icon-[ph--clock-counter-clockwise] block size-6" />
        </button>
      </div>
      {document ? <DocumentEditor documentId={id} initialContent={content} save={save} versionNumber={versionNumber} /> : null}
      <Drawer isOpen={isVersionsDrawerOpen} onClose={() => setIsVersionsDrawerOpen(false)}>
        <div className="flex items-center justify-between border-b border-white/70 pb-5">
          <h2 className="font-display text-primary text-2xl" id="document-versions-title">
            Versions
          </h2>
          <button
            aria-label="Close version history"
            className="text-secondary hover:bg-surface-raised hover:text-primary focus-visible:outline-accent rounded p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => setIsVersionsDrawerOpen(false)}
            type="button">
            <span aria-hidden="true" className="icon-[ph--x] block size-5" />
          </button>
        </div>
        <nav aria-label="Document versions" className="mt-5">
          <ul className="space-y-2">
            {versions.map((version) => (
              <li key={version.id}>
                <Link
                  className="text-secondary hover:bg-surface-raised hover:text-primary focus-visible:outline-accent block rounded px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => setIsVersionsDrawerOpen(false)}
                  params={{ id, versionNumber: version.versionNumber.toString() }}
                  to="/document/$id/$versionNumber">
                  Version {version.versionNumber}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>
    </div>
  );
}
