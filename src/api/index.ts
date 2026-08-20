import { documentApi } from "./documents";
import { documentVersionApi } from "./documentVersions";
import { projectApi } from "./projects";
import { tagApi } from "./tags";

export type { Document, DocumentSummary } from "./documents";
export type { DocumentVersion } from "./documentVersions";
export type { Project } from "./projects";
export type { Tag } from "./tags";

export const API = {
  documents: documentApi,
  documentVersions: documentVersionApi,
  projects: projectApi,
  tags: tagApi,
};
