import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { Document } from "@/utils/api";

import { Badge, DocumentEditor } from "@/components";
import { getDocument } from "@/utils/api";

const routeApi = getRouteApi("/document/$id");

export function DocumentRoute() {
  const { id } = routeApi.useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    setDocument(null);
    setLoadFailed(false);

    getDocument(id)
      .then((doc) => {
        if (!isCancelled) setDocument(doc);
      })
      .catch(() => {
        if (!isCancelled) setLoadFailed(true);
      });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  return (
    <div className="p-4">
      {loadFailed ? <Badge size="xs" title="Failed to load" variant="error" /> : null}
      {document ? <DocumentEditor documentId={id} initialContent={document.content} title={document.title} /> : null}
    </div>
  );
}
