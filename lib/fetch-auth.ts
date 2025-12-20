export async function fetchWithAuth(input: RequestInfo, token?: string | null, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
