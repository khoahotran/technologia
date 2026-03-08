import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ZodType } from "zod";

import {
  ApiError,
  AuthenticationError,
  ForbiddenError,
  NetworkError,
  ServerError,
} from "@/domain/errors";
import { authStorage } from "@/infrastructure/persistence/storage";
import { refreshResponseSchema } from "@/src/infrastructure/api/schemas";
import { env } from "@/src/shared/config/env";
import { useAuthSessionStore } from "@/src/store/auth-session.store";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  _retry?: boolean;
};

const REQUEST_TIMEOUT_MS = 30000;

const refreshClient = axios.create({
  baseURL: env.apiGatewayUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const axiosClient: AxiosInstance = axios.create({
  baseURL: env.apiGatewayUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

function readAccessToken() {
  const sessionToken = useAuthSessionStore.getState().session?.accessToken;
  return sessionToken ?? authStorage.getAccessToken();
}

function readRefreshToken() {
  const sessionToken = useAuthSessionStore.getState().session?.refreshToken;
  return sessionToken ?? authStorage.getRefreshToken();
}

function clearSession() {
  authStorage.clearTokens();
  useAuthSessionStore.getState().clearSession();
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = readRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await refreshClient.post("/api/auth/refresh-token", {
      refreshToken,
    });
    const parsed = refreshResponseSchema.parse(response.data);
    const nextAccessToken = parsed.data.accessToken;
    const nextRefreshToken = parsed.data.refreshToken ?? refreshToken;
    const store = useAuthSessionStore.getState();
    const currentSession = store.session;

    authStorage.setTokens(nextAccessToken, nextRefreshToken);

    if (currentSession) {
      store.setSession({
        ...currentSession,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      });
    }

    return nextAccessToken;
  } catch {
    clearSession();
    return null;
  }
}

function getOrStartRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readAccessToken();
  const requestConfig = config as InternalAxiosRequestConfig & { skipAuth?: boolean };

  if (!requestConfig.skipAuth && token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }

  return requestConfig;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    if (!error.config) {
      throw new NetworkError("Network request failed", error);
    }

    const config = error.config as ApiRequestConfig;
    const status = error.response?.status;
    const isAuthEndpoint =
      typeof config.url === "string" &&
      ["/api/auth/login/local", "/api/auth/login/google", "/api/auth/refresh-token"].some((path) =>
        config.url?.includes(path)
      );

    if (status === 401) {
      if (config._retry || isAuthEndpoint) {
        clearSession();
        throw new AuthenticationError("Session expired");
      }

      config._retry = true;
      const nextToken = await getOrStartRefresh();

      if (!nextToken) {
        clearSession();
        throw new AuthenticationError("Session expired");
      }

      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${nextToken}`;
      return axiosClient.request(config);
    }

    if (status === 403) {
      throw new ForbiddenError("Permission denied");
    }

    if (typeof status === "number" && status >= 500) {
      throw new ServerError("Server error", error.response?.data);
    }

    if (!status) {
      throw new NetworkError("Network request failed", error);
    }

    throw new ApiError(
      `API request failed with status ${status}`,
      status,
      config.url ?? "unknown",
      (config.method?.toUpperCase() as ApiMethod | undefined) ?? "GET",
      error.response?.data
    );
  }
);

export async function requestAndValidate<T>(
  config: ApiRequestConfig,
  schema: ZodType<T>
): Promise<T> {
  const response = await axiosClient.request<unknown>(config);
  return schema.parse(response.data);
}

export { axiosClient as apiClient };
