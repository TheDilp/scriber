import { documentApi } from "./documents";
import { documentVersionApi } from "./documentVersions";
import { projectApi } from "./projects";
import { tagApi } from "./tags";

export const API = {
  documents: documentApi,
  documentVersions: documentVersionApi,
  projects: projectApi,
  tags: tagApi,
};
