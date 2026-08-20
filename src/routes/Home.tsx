import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import type { Project } from "@/types";

import { API } from "@/api";
import { Button, Input, Modal } from "@/components";

function formatUpdated(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, { day: "numeric", month: "short" }).toUpperCase();
}

export function Home() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
    queryFn: API.projects.list,
    queryKey: ["home", "projects"],
  });
  const { isPending: isCreating, mutate: handleCreate } = useMutation({
    mutationFn: API.projects.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["home", "projects"] });
      setNewTitle("");
      setIsNewProjectModalOpen(false);
    },
  });

  return (
    <div className="bg-layout min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-14">
        <header className="border-secondary/15 flex items-end justify-between gap-4 border-b pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-tertiary font-mono text-[11px] tracking-[0.2em]">
              {projects.length === 0 ? "EMPTY SHELF" : `${projects.length} ${projects.length === 1 ? "PROJECT" : "PROJECTS"}`}
            </span>
            <h1 className="font-display text-primary text-4xl leading-none italic">Scriber</h1>
          </div>
          <Button
            isDisabled={isCreating}
            onClick={() => setIsNewProjectModalOpen(true)}
            title="New project"
            variant="primary"
          />
        </header>

        {projects.length === 0 ? (
          <div className="border-secondary/25 bg-surface rounded-surface flex flex-col items-center gap-2 border border-dashed px-6 py-20 text-center">
            <p className="font-display text-secondary text-2xl italic">There are no projects.</p>
            <p className="text-tertiary max-w-xs text-sm">Create a project and it will show up here.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {projects.map((project) => (
              <li key={project.id} className="group border-secondary/10 flex h-12 gap-4 border-b last:border-none">
                <Link
                  className="relative flex flex-1 items-center justify-between gap-4 py-4 pl-4"
                  params={{ projectId: project.id }}
                  to="/$projectId">
                  <span className="bg-accent absolute top-1/2 left-0 h-0 w-0.75 -translate-y-1/2 transition-[height] duration-200 ease-out group-hover:h-2/3" />
                  <span className="font-display text-primary truncate text-lg italic">{project.title || "Untitled"}</span>
                  <span className="text-tertiary shrink-0 font-mono text-[11px] tracking-wide">
                    {formatUpdated(project.updatedAt)}
                  </span>
                </Link>
                <span className="flex h-full w-0 items-center justify-center gap-x-2 transition-[width] group-hover:w-10">
                  <span className="icon-[ph--trash] text-error w-4 cursor-pointer" />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} titleId="new-project-title">
        <div className="flex flex-col gap-7 p-7 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-tertiary font-mono text-[10px] tracking-[0.18em]">NEW PROJECT</span>
              <h2 className="font-display text-primary text-3xl leading-none italic" id="new-project-title">
                Create a new project.
              </h2>
            </div>
            <button
              aria-label="Close new project dialog"
              className="text-tertiary hover:bg-layout hover:text-primary focus-visible:ring-accent/50 -mt-2 -mr-2 grid size-8 place-items-center rounded-full text-xl leading-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={() => setIsNewProjectModalOpen(false)}
              type="button">
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <Input onChange={(e) => setNewTitle(e.currentTarget.value)} title="Project title" value={newTitle} />

          <div className="border-secondary/10 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button onClick={() => setIsNewProjectModalOpen(false)} title="Cancel" variant="secondary" />
            <Button
              isDisabled={isCreating}
              onClick={() => handleCreate(newTitle)}
              title={isCreating ? "Creating..." : "Create"}
              variant="info"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
