import { useAuth } from "@/hooks/use-auth";

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const { token } = useAuth();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
