import type { ZodSchema } from "zod";

import {
  apiClient,
  fetchWithToken as coreFetchWithToken,
  requestInterceptor,
  errorHandler,
  type ApiClientOptions,
} from "@/src/infrastructure/clients/api-client";

export interface FetchOptions<TResponse extends ZodSchema = ZodSchema>
  extends Omit<ApiClientOptions, "body"> {
  body?: BodyInit | FormData | null | object;
  schema?: TResponse;
  skipAuth?: boolean;
  timeout?: number;
  retryDelay?: number;
}

export async function fetchWithToken<TResponse = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<TResponse> {
  const response = await coreFetchWithToken<TResponse>(endpoint, {
    method: options.method,
    body: options.body,
    query: options.query,
    headers: options.headers,
    requiresAuth: !options.skipAuth,
    timeoutMs: options.timeout,
    retries: options.retries,
  });

  if (options.schema) {
    return options.schema.parse(response) as TResponse;
  }

  return response;
}

export const http = {
  get: <T = unknown>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "GET", requiresAuth: !options?.skipAuth, timeoutMs: options?.timeout }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "POST", body, requiresAuth: !options?.skipAuth, timeoutMs: options?.timeout }),
  put: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "PUT", body, requiresAuth: !options?.skipAuth, timeoutMs: options?.timeout }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "PATCH", body, requiresAuth: !options?.skipAuth, timeoutMs: options?.timeout }),
  delete: <T = unknown>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE", requiresAuth: !options?.skipAuth, timeoutMs: options?.timeout }),
};

export { apiClient, requestInterceptor, errorHandler };
