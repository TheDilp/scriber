import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { DocumentSummary } from "@/utils/api";

import { Button } from "@/components";
import { createDocument, listDocuments } from "@/utils/api";

function formatUpdated(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, { day: "numeric", month: "short" }).toUpperCase();
}

export function Home() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    listDocuments().then((docs) => {
      if (!isCancelled) setDocuments(docs);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleCreate() {
    setIsCreating(true);
    try {
      const doc = await createDocument();
      void navigate({ params: { id: doc.id }, to: "/document/$id" });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="bg-layout min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-14">
        <header className="border-secondary/15 flex items-end justify-between gap-4 border-b pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-tertiary font-mono text-[11px] tracking-[0.2em]">
              {documents.length === 0 ? "EMPTY SHELF" : `${documents.length} ${documents.length === 1 ? "PAGE" : "PAGES"}`}
            </span>
            <h1 className="font-display text-primary text-4xl leading-none italic">Scriber</h1>
          </div>
          <Button isDisabled={isCreating} onClick={handleCreate} title="New page" variant="primary" />
        </header>

        {documents.length === 0 ? (
          <div className="border-secondary/25 bg-surface rounded-surface flex flex-col items-center gap-2 border border-dashed px-6 py-20 text-center">
            <p className="font-display text-secondary text-2xl italic">The page is blank.</p>
            <p className="text-tertiary max-w-xs text-sm">Start writing and it will show up here.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {documents.map((doc) => (
              <li key={doc.id} className="group border-secondary/10 border-b last:border-none">
                <Link
                  className="relative flex items-center justify-between gap-4 py-4 pl-4"
                  params={{ id: doc.id }}
                  to="/document/$id">
                  <span className="bg-accent absolute top-1/2 left-0 h-0 w-[3px] -translate-y-1/2 transition-[height] duration-200 ease-out group-hover:h-2/3" />
                  <span className="font-display text-primary truncate text-lg italic">{doc.title || "Untitled"}</span>
                  <span className="text-tertiary shrink-0 font-mono text-[11px] tracking-wide">
                    {formatUpdated(doc.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
