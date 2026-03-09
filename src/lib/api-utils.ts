import { REQUEST_CONFIG } from "@/constants";
import { safe } from "@/utils/result";

export async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
  const [json, error] = await safe(res.json());
  if (error) return {};
  if (json && typeof json === "object") return json as Record<string, unknown>;
  return {};
}

export async function getAuthToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader;
  }
  return null;
}

export function parseErrorMessage(data: unknown, fallbackError: string): string {
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
    return data.message;
  }
  return fallbackError;
}

export async function buildHeaders(
  req: Request,
  customHeaders?: Record<string, string>
): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": REQUEST_CONFIG.JSON_CONTENT_TYPE,
  };

  const authHeader = await getAuthToken(req);
  if (authHeader) headers["Authorization"] = authHeader;
  if (customHeaders) Object.assign(headers, customHeaders);

  return headers;
}
