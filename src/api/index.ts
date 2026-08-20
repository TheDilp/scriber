import { aliasApi } from "./aliases";
import { documentApi } from "./documents";
import { documentVersionApi } from "./documentVersions";
import { projectApi } from "./projects";
import { tagApi } from "./tags";

export const API = {
  aliases: aliasApi,
  documents: documentApi,
  documentVersions: documentVersionApi,
  projects: projectApi,
  tags: tagApi,
};
