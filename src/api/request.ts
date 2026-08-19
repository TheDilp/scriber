export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) throw new Error(`Request to ${path} failed with status ${response.status}`);

  return response.json() as Promise<T>;
}
