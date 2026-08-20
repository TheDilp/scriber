import { Link, useParams } from "@tanstack/react-router";

import { Button } from "./Button";

export function Navbar() {
  const { documentId, projectId } = useParams({ strict: false });
  return (
    <nav
      aria-label="Document navigation"
      className="border-secondary/15 bg-surface/85 flex max-h-12 min-h-12 max-w-full items-center justify-between border-b px-2 backdrop-blur-sm">
      {projectId && documentId ? (
        <Link
          aria-label="Back to project"
          className="text-secondary hover:bg-layout hover:text-primary focus-visible:ring-accent/50 group inline-flex h-8 items-center gap-2 rounded-md px-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          params={{ projectId }}
          to="/$projectId">
          <span
            aria-hidden="true"
            className="icon-[ph--arrow-left] size-4 transition-transform duration-150 group-hover:-translate-x-0.5"
          />
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase">Project</span>
        </Link>
      ) : null}
      {projectId && !documentId ? (
        <Link
          aria-label="Back to home"
          className="text-secondary hover:bg-layout hover:text-primary focus-visible:ring-accent/50 group inline-flex h-8 items-center gap-2 rounded-md px-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          to="/">
          <span
            aria-hidden="true"
            className="icon-[ph--arrow-left] size-4 transition-transform duration-150 group-hover:-translate-x-0.5"
          />
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase">Home</span>
        </Link>
      ) : null}

      <div className="ml-auto">
        <Button icon="icon-[ph--magnifying-glass]" onClick={undefined} />
      </div>
    </nav>
  );
}
