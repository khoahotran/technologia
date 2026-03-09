import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/store";
import { authStorage } from "@/utils/storage";

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

const api = axios.create({
  baseURL: env.apiGatewayUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const refreshApi = axios.create({
  baseURL: env.apiGatewayUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const getAccessToken = () =>
  useAuthStore.getState().session?.accessToken ?? authStorage.getAccessToken();

const getRefreshToken = () =>
  useAuthStore.getState().session?.refreshToken ?? authStorage.getRefreshToken();

const clearAuthState = () => {
  authStorage.clearTokens();
  useAuthStore.getState().clearSession();
};

const saveTokens = (accessToken: string, refreshToken: string) => {
  const current = useAuthStore.getState().session;
  if (current) {
    useAuthStore.getState().setSession({
      ...current,
      accessToken,
      refreshToken,
    });
    return;
  }
  authStorage.setTokens(accessToken, refreshToken);
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await refreshApi.post("/api/auth/refresh-token", { refreshToken });
    const payload = response.data as {
      data?: { accessToken?: string; token?: string; refreshToken?: string };
    };
    const nextAccessToken = payload.data?.accessToken ?? payload.data?.token;
    if (!nextAccessToken) {
      return null;
    }
    const nextRefreshToken = payload.data?.refreshToken ?? refreshToken;
    saveTokens(nextAccessToken, nextRefreshToken);
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
  (response) => response.data,
  async (error: AxiosError) => {
    const status = error.response?.status ?? 500;
    const data = error.response?.data as {
      message?: string;
      error?: string;
      code?: string;
    };
    const message =
      data?.message ?? data?.error ?? error.message ?? "Unexpected request error";
    const code = data?.code ?? `HTTP_ERROR_${status}`;
    const config = error.config as RetryConfig | undefined;

    if (status === 401 && config) {
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

      clearAuthState();
      throw new AppError("Session expired. Please login again.", 401, "UNAUTHORIZED", data);
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

export default api;
