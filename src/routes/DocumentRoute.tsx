import type { NodeJSON } from "prosekit/core";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { documentApi } from "@/api";
import { Badge, Button, DocumentEditor, Drawer } from "@/components";
import { formatDateStringToDateTime } from "@/utils/datetime";
import { parseContent } from "@/utils/document";
import { documentQueryOptions, documentVersionQueryOptions, documentVersionsQueryOptions } from "@/utils/queries";

const routeApi = getRouteApi("/document/$id/$versionNumber");

export function DocumentRoute() {
  const { id, versionNumber } = routeApi.useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState<"documentSettings" | "documentVersions" | null>(null);

  const [{ data: document, isLoadingError }, { data: documentVersion, isFetching: isLoadingDocumentVersion }] = useQueries({
    queries: [documentQueryOptions(id), documentVersionQueryOptions(id, versionNumber)],
  });

  const {
    isError: isSaveError,
    isPending: isSaving,
    isSuccess: isSaved,
    mutate: save,
  } = useMutation({
    mutationFn: (content: NodeJSON) => documentApi.updateVersion(id, versionNumber, content),
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["documents", id] });
    },
  });

  const content = useMemo(() => parseContent(documentVersion?.content), [documentVersion]);
  //TODO: Skeleton component
  if (isLoadingDocumentVersion) return null;

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-4">
        {document?.title ? (
          <div className="mr-auto flex items-center justify-between gap-2">
            {document?.title ? <h1 className="font-display text-4xl font-medium tracking-tight">{document.title}</h1> : null}
            {documentVersion?.versionNumber ? <Badge title={`Version - ${documentVersion.versionNumber}`} /> : null}
          </div>
        ) : null}
        {isLoadingError ? <Badge size="xs" title="Failed to load" variant="error" /> : null}
        {isSaved ? <Badge title="Saved" variant="success" /> : null}
        {isSaving ? <Badge title="Saving…" variant="info" /> : null}
        {isSaveError ? <Badge title="Save failed" variant="error" /> : null}

        <Button icon="icon-[ph--clock-counter-clockwise]" onClick={() => setIsDrawerOpen("documentVersions")} />
        <Button icon="icon-[ph--gear]" onClick={() => setIsDrawerOpen("documentSettings")} />
      </div>
      {document ? <DocumentEditor documentId={id} initialContent={content} save={save} versionNumber={versionNumber} /> : null}
      <Drawer isOpen={isDrawerOpen !== null} onClose={() => setIsDrawerOpen(null)}>
        {isDrawerOpen === "documentVersions" ? (
          <DocumentVersionsDrawer content={content} setIsDrawerOpen={setIsDrawerOpen} />
        ) : null}
      </Drawer>
    </div>
  );
}

function DocumentVersionsDrawer({
  content,
  setIsDrawerOpen,
}: {
  content: NodeJSON | undefined;
  setIsDrawerOpen: (v: null) => void;
}) {
  const { id } = routeApi.useParams();
  const { data: versions = [] } = useQuery(documentVersionsQueryOptions(id));

  const { isPending: isCreatingVersion, mutate: createVersion } = useMutation({
    mutationFn: (content: NodeJSON) => documentApi.createVersion(id, content),
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["documentVersions", id] });
    },
  });
  return (
    <>
      <div className="border-secondary/40 mb-4 flex items-center justify-between border-b">
        <h2 className="font-display text-primary text-2xl">Versions</h2>
        <Button icon="icon-[ph--x]" onClick={() => setIsDrawerOpen(null)} />
      </div>
      <div className="ml-auto">
        {id ? (
          <Button
            isDisabled={isCreatingVersion}
            onClick={() => {
              if (content) createVersion(content);
            }}
            title="New version"
          />
        ) : null}
      </div>
      <nav aria-label="Document versions" className="mt-5">
        <ul className="space-y-2">
          {versions.map((version) => (
            <li key={version.id} className="border-secondary/40 flex w-full items-center gap-2 rounded-md border p-2 shadow">
              <span className="flex-1">
                Version {version.versionNumber} &nbsp;
                <span className="text-sm">({formatDateStringToDateTime(version.createdAt)})</span>
              </span>
              <Link
                className="text-secondary hover:text-info flex items-center justify-between gap-x-2 text-lg font-medium transition-colors"
                onClick={() => setIsDrawerOpen(null)}
                params={{ id, versionNumber: version.versionNumber.toString() }}
                to="/document/$id/$versionNumber">
                <Button onClick={() => {}} size="sm" title="Open" variant="info" />
              </Link>

              <Button onClick={() => {}} size="sm" title="Delete" variant="error" />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
