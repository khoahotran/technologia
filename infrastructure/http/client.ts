/**
 * HTTP Client
 *
 * Axios-based HTTP client with:
 * - Automatic token refresh
 * - Request/response interceptors
 * - Structured error handling
 * - Request logging
 * - Retry logic with exponential backoff
 */

import axios, {
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
    AxiosError,
} from "axios";

import {
    AppError,
    AuthenticationError,
    NetworkError,
    TimeoutError,
    createHttpError,
    getErrorMessage,
} from "@/domain/errors";
import { authStorage } from "@/infrastructure/persistence/storage";
import { createScopedLogger } from "@/lib/logger";
import { REQUEST_CONFIG, HTTP_STATUS } from "@/shared/constants";

// ===========================================
// Configuration
// ===========================================

const BASE_URL = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3000/api";
const httpLogger = createScopedLogger("HTTP");

// ===========================================
// Create Axios Instance
// ===========================================

export const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": REQUEST_CONFIG.JSON_CONTENT_TYPE,
    },
    timeout: REQUEST_CONFIG.TIMEOUT,
});

// ===========================================
// Token Refresh State
// ===========================================

interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token!);
        }
    });
    failedQueue = [];
};

// ===========================================
// Request Interceptor
// ===========================================

httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const requestId = crypto.randomUUID?.() || Date.now().toString();
        config.headers.set("X-Request-ID", requestId);

        const token = authStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (process.env.NODE_ENV !== "production") {
            httpLogger.debug("Request", {
                method: config.method?.toUpperCase(),
                url: config.url,
                requestId,
            });
        }

        return config;
    },
    (error) => {
        httpLogger.error("Request interceptor error", error);
        return Promise.reject(error);
    }
);

// ===========================================
// Response Interceptor
// ===========================================

httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (process.env.NODE_ENV !== "production") {
            const requestId = response.config.headers?.["X-Request-ID"];
            httpLogger.debug("Response", {
                status: response.status,
                url: response.config.url,
                requestId,
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Handle network errors
        if (!error.response) {
            if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
                return Promise.reject(new TimeoutError("Request timed out", REQUEST_CONFIG.TIMEOUT));
            }
            return Promise.reject(new NetworkError("Network error - please check your connection"));
        }

        const { status, data } = error.response;

        // Log error
        httpLogger.error("API Error", error, {
            status,
            url: originalRequest?.url,
            message: (data as Record<string, unknown>)?.["message"],
        });

        // Token Refresh Logic
        const isAuthRoute = originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh-token");

        if ((status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN) && !originalRequest._retry && !isAuthRoute) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = "Bearer " + token;
                        }
                        return httpClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = authStorage.getRefreshToken();
            if (!refreshToken) {
                authStorage.clearTokens();
                processQueue(new AuthenticationError("No refresh token available"), null);
                isRefreshing = false;
                if (typeof window !== "undefined") {
                    window.location.href = "/login?error=session_expired";
                }
                return Promise.reject(new AuthenticationError("Authentication required"));
            }

            try {
                const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

                authStorage.setTokens(newAccessToken, newRefreshToken || refreshToken);
                httpClient.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken;

                processQueue(null, newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = "Bearer " + newAccessToken;
                }

                return httpClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                authStorage.clearTokens();
                if (typeof window !== "undefined") {
                    window.location.href = "/login?error=session_expired";
                }
                return Promise.reject(new AuthenticationError("Session expired"));
            } finally {
                isRefreshing = false;
            }
        }

        // Standard Error Handling
        const dataRecord = data as Record<string, unknown>;
        const errorMessage = (typeof dataRecord?.["message"] === "string" ? dataRecord["message"] : "") || getErrorMessage(error);
        const appError = createHttpError(status, errorMessage, {
            url: originalRequest?.url,
            method: originalRequest?.method,
            data,
        });

        return Promise.reject(appError);
    }
);

// ===========================================
// Helper Methods
// ===========================================

/**
 * Retry a request with exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (error instanceof AuthenticationError || (error instanceof AppError && error.statusCode < 500)) {
                throw error;
            }

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}

/**
 * Type-safe HTTP Methods
 */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await httpClient.get<T>(url, { params });
    return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
    const response = await httpClient.post<T>(url, data);
    return response.data;
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
    const response = await httpClient.put<T>(url, data);
    return response.data;
}

export async function del<T>(url: string): Promise<T> {
    const response = await httpClient.delete<T>(url);
    return response.data;
}

// Export convenience object
export const http = {
    client: httpClient,
    get,
    post,
    put,
    delete: del,
    withRetry,
};
