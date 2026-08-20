import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { searchQueryOptions } from "@/utils/queries";

import { Button } from "./Button";
import { Drawer } from "./Drawer";
import { Input } from "./Input";

export function Navbar() {
  const { documentId, projectId } = useParams({ strict: false });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const { data: results = [] } = useQuery(searchQueryOptions(deferredSearchValue));

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
        <Button icon="icon-[ph--magnifying-glass]" onClick={() => setIsSearchOpen(true)} />
      </div>

      <Drawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}>
        <div className="border-secondary/40 mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="font-display text-primary text-2xl">Search</h2>
          <Button icon="icon-[ph--x]" onClick={() => setIsSearchOpen(false)} />
        </div>
        <Input onChange={(e) => setSearchValue(e.target.value)} placeholder="Search documents…" value={searchValue} />
        <nav aria-label="Search results" className="mt-5">
          <ul className="space-y-2">
            {results.map((result) => (
              <li key={result.id} className="border-secondary/40 rounded-md border p-2 shadow">
                <Link
                  className="text-primary hover:text-info flex flex-col gap-0.5 text-sm font-medium transition-colors"
                  onClick={() => setIsSearchOpen(false)}
                  params={{
                    documentId: result.id,
                    projectId: result.projectId,
                    versionNumber: result.currentVersion.toString(),
                  }}
                  to="/$projectId/document/$documentId/$versionNumber">
                  {result.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>
    </nav>
  );
}
