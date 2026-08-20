import type { NodeJSON } from "prosekit/core";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { API } from "@/api";
import { Autocomplete, type AutocompleteOption, Badge, Button, DocumentEditor, Drawer } from "@/components";
import {
  documentAliasesQueryOptions,
  documentQueryOptions,
  documentTagsQueryOptions,
  documentVersionQueryOptions,
  documentVersionsQueryOptions,
} from "@/queries";
import { formatDateStringToDateTime } from "@/utils/datetime";
import { parseContent } from "@/utils/document";

const routeApi = getRouteApi("/$projectId/document/$documentId/$versionNumber");

export function DocumentRoute() {
  const { documentId, versionNumber } = routeApi.useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState<"documentSettings" | "documentVersions" | null>(null);

  const [{ data: document, isLoadingError }, { data: documentVersion, isFetching: isLoadingDocumentVersion }] = useQueries({
    queries: [documentQueryOptions(documentId), documentVersionQueryOptions(documentId, versionNumber)],
  });

  const {
    isError: isSaveError,
    isPending: isSaving,
    isSuccess: isSaved,
    mutate: save,
  } = useMutation({
    mutationFn: (content: NodeJSON) => API.documentVersions.update(documentId, versionNumber, content),
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["documents", documentId] });
    },
  });

  const content = useMemo(() => parseContent(documentVersion?.content), [documentVersion]);
  //TODO: Skeleton component
  if (isLoadingDocumentVersion) return null;

  return (
    <div className="flex flex-1 flex-col p-4">
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
      {document ? (
        <DocumentEditor documentId={documentId} initialContent={content} save={save} versionNumber={versionNumber} />
      ) : null}
      <Drawer isOpen={isDrawerOpen !== null} onClose={() => setIsDrawerOpen(null)}>
        {isDrawerOpen === "documentVersions" ? (
          <DocumentVersionsDrawer content={content} setIsDrawerOpen={setIsDrawerOpen} />
        ) : null}
        {isDrawerOpen === "documentSettings" ? <DocumentSettingsDrawer setIsDrawerOpen={setIsDrawerOpen} /> : null}
      </Drawer>
    </div>
  );
}

function DocumentSettingsDrawer({ setIsDrawerOpen }: { setIsDrawerOpen: (v: null) => void }) {
  const { documentId } = routeApi.useParams();
  const { data: document } = useQuery(documentQueryOptions(documentId));
  const { data: tags = [] } = useQuery({
    enabled: Boolean(document?.projectId),
    queryFn: () => API.tags.listByProject(document?.projectId ?? ""),
    queryKey: ["tags", document?.projectId],
  });
  const tagOptions = tags.map(({ id: tagId, title }) => ({ id: tagId, label: title }));

  const queryClient = useQueryClient();

  const { data: documentTags = [] } = useQuery(documentTagsQueryOptions(documentId));
  const selectedTags = documentTags.map(({ id: tagId, title }) => ({ id: tagId, label: title }));

  function invalidateTags() {
    return queryClient.invalidateQueries({ queryKey: ["documentTags", documentId] });
  }
  const { mutate: createTag } = useMutation({
    mutationFn: (title: string) => API.tags.createForDocument(documentId, title),
    onSuccess: invalidateTags,
  });
  const { mutate: removeTag } = useMutation({
    mutationFn: (tagId: string) => API.tags.removeFromDocument(documentId, tagId),
    onSuccess: invalidateTags,
  });

  function handleTagsChange(next: AutocompleteOption[]) {
    const added = next.find((option) => !selectedTags.some(({ id: tagId }) => tagId === option.id));
    if (added) {
      createTag(added.label);
      return;
    }

    const removed = selectedTags.find((option) => !next.some(({ id: tagId }) => tagId === option.id));
    if (removed) removeTag(removed.id);
  }

  const { data: documentAliases = [] } = useQuery(documentAliasesQueryOptions(documentId));
  const aliases = documentAliases.map(({ id: aliasId, title }) => ({ id: aliasId, label: title }));

  function invalidateAliases() {
    return queryClient.invalidateQueries({ queryKey: ["documentAliases", documentId] });
  }
  const { mutate: createAlias } = useMutation({
    mutationFn: (title: string) => API.aliases.createForDocument(documentId, title),
    onSuccess: invalidateAliases,
  });
  const { mutate: removeAlias } = useMutation({
    mutationFn: (aliasId: string) => API.aliases.removeFromDocument(documentId, aliasId),
    onSuccess: invalidateAliases,
  });

  function handleAliasesChange(next: AutocompleteOption[]) {
    const added = next.find((option) => !aliases.some(({ id: aliasId }) => aliasId === option.id));
    if (added) {
      createAlias(added.label);
      return;
    }

    const removed = aliases.find((option) => !next.some(({ id: aliasId }) => aliasId === option.id));
    if (removed) removeAlias(removed.id);
  }

  return (
    <>
      <div className="border-secondary/40 mb-6 flex items-center justify-between border-b pb-4">
        <h2 className="font-display text-primary text-2xl">Document settings</h2>
        <Button icon="icon-[ph--x]" onClick={() => setIsDrawerOpen(null)} />
      </div>
      <div className="flex flex-col gap-6">
        <Autocomplete
          allowCustomValues
          onChange={handleTagsChange}
          options={tagOptions}
          placeholder="Search or type a tag and press Enter"
          title="Tags"
          value={selectedTags}
        />
        <Autocomplete
          allowCustomValues
          onChange={handleAliasesChange}
          options={[]}
          placeholder="Type an alias and press Enter"
          title="Document aliases"
          value={aliases}
        />
      </div>
    </>
  );
}

function DocumentVersionsDrawer({
  content,
  setIsDrawerOpen,
}: {
  content: NodeJSON | undefined;
  setIsDrawerOpen: (v: null) => void;
}) {
  const { documentId, projectId } = routeApi.useParams();
  const { data: versions = [] } = useQuery(documentVersionsQueryOptions(documentId));

  const { isPending: isCreatingVersion, mutate: createVersion } = useMutation({
    mutationFn: (content: NodeJSON) => API.documentVersions.create(documentId, content),
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["documentVersions", documentId] });
    },
  });
  return (
    <>
      <div className="border-secondary/40 mb-4 flex items-center justify-between border-b">
        <h2 className="font-display text-primary text-2xl">Versions</h2>
        <Button icon="icon-[ph--x]" onClick={() => setIsDrawerOpen(null)} />
      </div>
      <div className="ml-auto">
        {documentId ? (
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
                params={{ documentId, projectId, versionNumber: version.versionNumber.toString() }}
                to="/$projectId/document/$documentId/$versionNumber">
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
