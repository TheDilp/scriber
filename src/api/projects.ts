import type { Project } from "@/types";

import { request } from "./request";

async function list(): Promise<Project[]> {
  return request<Project[]>("/api/v1/projects");
}

async function create(title: string): Promise<string> {
  return request<string>("/api/v1/projects", {
    body: JSON.stringify({ title }),
    method: "POST",
  });
}

async function get(id: string): Promise<Project> {
  return request<Project>(`/api/v1/projects/${id}`);
}

async function update(id: string, patch: { title?: string }): Promise<string> {
  return request<string>(`/api/v1/projects/${id}`, {
    body: JSON.stringify({ title: patch.title }),
    method: "PUT",
  });
}

async function remove(id: string): Promise<void> {
  await request<null>(`/api/v1/projects/${id}`, { method: "DELETE" });
}

export const projectApi = { create, get, list, remove, update };
