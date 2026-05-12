import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/store";
import { authStorage } from "@/utils/storage";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_BUFFER_MS = 60 * 1000; // refresh 1 min before expiry

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "UNKNOWN_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

const isServer = typeof window === "undefined";
const baseURL = isServer ? env.apiGatewayUrl : "";

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const refreshApi = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type BackendErrorPayload = {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  path?: string;
  details?: unknown;
};

const getAccessToken = () =>
  useAuthStore.getState().session?.accessToken ?? authStorage.getAccessToken();

const getRefreshToken = () =>
  useAuthStore.getState().session?.refreshToken ?? authStorage.getRefreshToken();

const clearAuthState = (shouldRedirect = true) => {
  authStorage.clearTokens();
  useAuthStore.getState().clearSession();
  clearAutoRefresh();
  if (shouldRedirect && !isServer && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

const saveTokens = (accessToken: string, refreshToken: string) => {
  const current = useAuthStore.getState().session;
  if (current) {
    useAuthStore.getState().setSession({
      ...current,
      accessToken,
      refreshToken,
    });
    scheduleAutoRefresh();
    return;
  }
  authStorage.setTokens(accessToken, refreshToken);
  scheduleAutoRefresh();
};

let refreshPromise: Promise<string | null> | null = null;

let autoRefreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoRefresh() {
  clearAutoRefresh();
  const session = useAuthStore.getState().session;
  const storedRefresh = authStorage.getRefreshToken();
  if (!session?.refreshToken && !storedRefresh) return;

  const delay = ACCESS_TOKEN_TTL_MS - REFRESH_BUFFER_MS;
  autoRefreshTimer = setTimeout(() => {
    runRefreshOnce();
  }, Math.max(delay, 1000));
}

function clearAutoRefresh() {
  if (autoRefreshTimer) {
    clearTimeout(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await refreshApi.post("/api/auth/refresh-token", { refreshToken });
    const payload = response.data as {
      data?: { accessToken?: string; refreshToken?: string };
    };
    const nextAccessToken = payload.data?.accessToken;
    if (!nextAccessToken) {
      return null;
    }
    const nextRefreshToken = payload.data?.refreshToken ?? refreshToken;
    saveTokens(nextAccessToken, nextRefreshToken);
    scheduleAutoRefresh();
    return nextAccessToken;
  } catch {
    return null;
  }
}

function runRefreshOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = response.data as any;
    // Some APIs return 200 OK but with status: 500 in the body
    if (payload && typeof payload === "object" && payload.status !== undefined && payload.status !== 200) {
      throw new AppError(payload.message || "Operation failed", payload.status, payload.code || "BUSINESS_ERROR", payload);
    }
    return payload;
  },
  async (error: AxiosError) => {
    const status = error.response?.status ?? 500;
    const data = (error.response?.data ?? {}) as BackendErrorPayload;
    const message =
      data?.message ?? data?.error ?? error.message ?? "Unexpected request error";
    const code = data?.code ?? `HTTP_ERROR_${status}`;
    const config = error.config as RetryConfig | undefined;

    if ((status === 401 || status === 403) && config) {
      const isAuthRoute =
        typeof config.url === "string" && config.url.startsWith("/api/auth/");

      if (!config._retry && !isAuthRoute) {
        config._retry = true;
        const token = await runRefreshOnce();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return api.request(config);
        }
      }

      // If we reach here, either it's an auth route, already retried, or refresh failed
      if (status === 401 || (status === 403 && !isAuthRoute)) {
        const shouldRedirect = config.headers?.["x-no-redirect"] !== "true";
        clearAuthState(shouldRedirect);
        if (isAuthRoute) {
          throw new AppError(message, 401, code, data);
        }
        throw new AppError("Session expired. Please login again.", 401, "UNAUTHORIZED", data);
      }
    }

    if (status === 403) {
      throw new AppError("Forbidden request.", 403, "FORBIDDEN", data);
    }

    if (status >= 500) {
      throw new AppError("Server error. Please try again later.", status, code, data);
    }

    throw new AppError(message, status, code, data);
  }
);

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  api.get<T, T>(url, config);

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.post<T, T>(url, data, config);

export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.put<T, T>(url, data, config);

export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.patch<T, T>(url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  api.delete<T, T>(url, config);

/**
 * Initialize auto-refresh timer on app startup.
 * Call once after auth store hydration is complete.
 */
export function initAutoRefresh() {
  scheduleAutoRefresh();
}

export default api;
