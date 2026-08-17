import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { DocumentSummary } from "@/utils/api";

import { Button } from "@/components";
import { createDocument, listDocuments } from "@/utils/api";

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-primary text-lg font-semibold">Documents</h1>
        <Button isDisabled={isCreating} onClick={handleCreate} title="New document" variant="info" />
      </div>
      <ul className="flex flex-col gap-1">
        {documents.map((doc) => (
          <li key={doc.id}>
            <Link
              className="rounded-control hover:bg-layout flex items-center justify-between gap-2 p-2 text-sm"
              params={{ id: doc.id }}
              to="/document/$id">
              <span className="text-primary">{doc.title || "Untitled"}</span>
              <span className="text-secondary text-xs">{new Date(doc.updatedAt).toLocaleString()}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
