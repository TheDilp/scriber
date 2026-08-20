export type DocumentSummary = {
  currentVersion: number;
  id: string;
  title: string;
  updatedAt: string;
};

export type Document = {
  createdAt: string;
  currentVersion: number;
  id: string;
  projectId: string;
  title: string;
  updatedAt: string;
};
