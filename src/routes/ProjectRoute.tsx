import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";

import type { DocumentSummary } from "@/types";

import { API } from "@/api";
import { Button, Input, Modal } from "@/components";

function formatUpdated(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, { day: "numeric", month: "short" }).toUpperCase();
}

export function ProjectRoute() {
  const { projectId } = useParams({ from: "/$projectId" });
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState("");
  const [isNewDocumentModalOpen, setIsNewDocumentModalOpen] = useState(false);

  const { data: project } = useQuery({
    queryFn: () => API.projects.get(projectId),
    queryKey: ["projects", projectId],
  });
  const { data: documents = [] } = useQuery<DocumentSummary[]>({
    queryFn: API.documents.list,
    queryKey: ["projects", projectId, "documents"],
  });
  const { isPending: isCreating, mutate: createDocument } = useMutation({
    mutationFn: API.documents.create,
    onSuccess: (id) => navigate({ params: { id, versionNumber: "1" }, to: "/document/$id/$versionNumber" }),
  });

  return (
    <div className="bg-layout min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-14">
        <header className="border-secondary/15 flex items-end justify-between gap-4 border-b pb-6">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-tertiary font-mono text-[11px] tracking-[0.2em]">
              {documents.length === 0
                ? "EMPTY SHELF"
                : `${documents.length} ${documents.length === 1 ? "DOCUMENT" : "DOCUMENTS"}`}
            </span>
            <h1 className="font-display text-primary truncate text-4xl leading-none italic">{project?.title || "Untitled"}</h1>
          </div>
          <Button
            isDisabled={isCreating}
            onClick={() => setIsNewDocumentModalOpen(true)}
            title="New document"
            variant="primary"
          />
        </header>

        {documents.length === 0 ? (
          <div className="border-secondary/25 bg-surface rounded-surface flex flex-col items-center gap-2 border border-dashed px-6 py-20 text-center">
            <p className="font-display text-secondary text-2xl italic">There are no documents.</p>
            <p className="text-tertiary max-w-xs text-sm">Start writing and it will show up here.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {documents.map((document) => (
              <li key={document.id} className="group border-secondary/10 flex h-12 gap-4 border-b last:border-none">
                <Link
                  className="relative flex flex-1 items-center justify-between gap-4 py-4 pl-4"
                  params={{ id: document.id, versionNumber: "1" }}
                  to="/document/$id/$versionNumber">
                  <span className="bg-accent absolute top-1/2 left-0 h-0 w-0.75 -translate-y-1/2 transition-[height] duration-200 ease-out group-hover:h-2/3" />
                  <span className="font-display text-primary truncate text-lg italic">{document.title || "Untitled"}</span>
                  <span className="text-tertiary shrink-0 font-mono text-[11px] tracking-wide">
                    {formatUpdated(document.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal isOpen={isNewDocumentModalOpen} onClose={() => setIsNewDocumentModalOpen(false)} titleId="new-document-title">
        <div className="flex flex-col gap-7 p-7 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-tertiary font-mono text-[10px] tracking-[0.18em]">FRESH SHEET</span>
              <h2 className="font-display text-primary text-3xl leading-none italic" id="new-document-title">
                Create a new document.
              </h2>
            </div>
            <button
              aria-label="Close new document dialog"
              className="text-tertiary hover:bg-layout hover:text-primary focus-visible:ring-accent/50 -mt-2 -mr-2 grid size-8 place-items-center rounded-full text-xl leading-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={() => setIsNewDocumentModalOpen(false)}
              type="button">
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <Input onChange={(event) => setNewTitle(event.currentTarget.value)} title="Document title" value={newTitle} />

          <div className="border-secondary/10 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button onClick={() => setIsNewDocumentModalOpen(false)} title="Cancel" variant="secondary" />
            <Button
              isDisabled={isCreating}
              onClick={() => createDocument({ projectId, title: newTitle })}
              title={isCreating ? "Creating..." : "Create"}
              variant="info"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
