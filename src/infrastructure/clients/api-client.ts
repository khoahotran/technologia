import { randomUUID } from "node:crypto";

import { AppError, AuthenticationError, NetworkError, TimeoutError } from "@/domain/errors";
import { mapHttpError } from "@/infrastructure/http/api-error-mapper";
import { authStorage } from "@/infrastructure/persistence/storage";
import { env } from "@/src/shared/config/env";

export interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: BodyInit | FormData | null | object;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_RETRIES = 1;

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>
) {
  const url = new URL(path.replace(/^\//, ""), env.internalApiBaseUrl);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function refreshAccessToken() {
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(buildUrl("/auth/refresh-token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    data?: { accessToken?: string; token?: string; refreshToken?: string };
  };
  const nextAccessToken = payload.data?.accessToken || payload.data?.token;

  if (!nextAccessToken) {
    return null;
  }

  authStorage.setTokens(
    nextAccessToken,
    payload.data?.refreshToken || refreshToken
  );

  return nextAccessToken;
}

export async function requestInterceptor(options: ApiClientOptions = {}) {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Request-Id": randomUUID(),
    ...options.headers,
  };

  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (options.requiresAuth !== false) {
    const accessToken = authStorage.getAccessToken();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
}

export async function errorHandler(response: Response, path: string) {
  let payload: unknown = {};

  try {
    payload = await response.json();
  } catch {
    payload = { message: response.statusText };
  }

  return mapHttpError(response.status, payload, path);
}

export async function apiClient<T = unknown>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
  } = options;

  let attempt = 0;
  let lastError: AppError | null = null;

  while (attempt <= retries) {
    attempt += 1;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const headers = await requestInterceptor(options);
      const isFormData = body instanceof FormData;
      const response = await fetch(buildUrl(path, query), {
        method,
        headers,
        credentials: "include",
        signal: controller.signal,
        body:
          body == null
            ? null
            : isFormData || typeof body === "string"
              ? (body as BodyInit)
              : JSON.stringify(body),
      });

      clearTimeout(timeoutId);

      if (response.status === 401 && options.requiresAuth !== false) {
        const refreshedToken = await refreshAccessToken();

        if (refreshedToken && attempt === 1) {
          continue;
        }

        throw new AuthenticationError("Session expired");
      }

      if (!response.ok) {
        throw await errorHandler(response, path);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AppError) {
        lastError = error;
      } else if (error instanceof DOMException && error.name === "AbortError") {
        lastError = new TimeoutError(`Request timed out after ${timeoutMs}ms`, timeoutMs);
      } else if (error instanceof TypeError) {
        lastError = new NetworkError("Network request failed", error);
      } else {
        lastError = new AppError(
          error instanceof Error ? error.message : "Unknown request failure",
          "API_CLIENT_ERROR",
          500,
          error
        );
      }

      if (
        attempt <= retries &&
        (lastError instanceof NetworkError ||
          lastError instanceof TimeoutError ||
          lastError.statusCode >= 500)
      ) {
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new AppError("API client failed", "API_CLIENT_ERROR", 500);
}

export async function fetchWithToken<T = unknown>(
  path: string,
  options: ApiClientOptions = {}
) {
  return apiClient<T>(path, { ...options, requiresAuth: true });
}
