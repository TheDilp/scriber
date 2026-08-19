import type { NodeJSON } from "prosekit/core";

import type { DocumentVersion } from "@/api";
export function parseContent(content: DocumentVersion["content"]): NodeJSON | undefined {
  if (!content) return undefined;
  return JSON.parse(content);
}
