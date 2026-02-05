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

import { STORAGE_KEYS, REQUEST_CONFIG, HTTP_STATUS } from "@/shared/constants";
import {
    AppError,
    AuthenticationError,
    NetworkError,
    TimeoutError,
    createHttpError,
    getErrorMessage,
} from "@/lib/errors";
import { logger, createScopedLogger } from "@/lib/logger";
import { authStorage } from "@/lib/storage";

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
// Request Queue for Token Refresh
// ===========================================

interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// ===========================================
// Request Interceptor
// ===========================================

httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add request ID for tracing
        const requestId = crypto.randomUUID?.() || Date.now().toString();
        config.headers.set("X-Request-ID", requestId);

        // Add auth token if available
        const token = authStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
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
        // Log successful response in development
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
            _retryCount?: number;
        };

        // Handle network errors
        if (!error.response) {
            if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
                httpLogger.error("Request timeout", error, {
                    url: originalRequest?.url,
                });
                return Promise.reject(
                    new TimeoutError("Request timed out", REQUEST_CONFIG.TIMEOUT)
                );
            }

            httpLogger.error("Network error", error, {
                url: originalRequest?.url,
            });
            return Promise.reject(
                new NetworkError("Network error - please check your connection")
            );
        }

        const { status, data } = error.response;
        const requestId = originalRequest?.headers?.["X-Request-ID"] as string;

        // Log error response
        httpLogger.error("API Error", error, {
            status,
            url: originalRequest?.url,
            requestId,
            message: (data as Record<string, unknown>)?.["message"],
        });

        // Handle 401 Unauthorized - Token Refresh
        if (status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
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
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = authStorage.getRefreshToken();

            if (!refreshToken) {
                authStorage.clearTokens();
                processQueue(new AuthenticationError("No refresh token available"), null);
                isRefreshing = false;
                return Promise.reject(new AuthenticationError("Authentication required"));
            }

            try {
                const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
                    refreshToken: refreshToken,
                });

                if (response.status === HTTP_STATUS.OK || response.status === HTTP_STATUS.CREATED) {
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                        response.data.data;

                    authStorage.setTokens(newAccessToken, newRefreshToken || refreshToken);

                    httpClient.defaults.headers.common["Authorization"] =
                        "Bearer " + newAccessToken;

                    processQueue(null, newAccessToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = "Bearer " + newAccessToken;
                    }

                    httpLogger.info("Token refreshed successfully");
                    return httpClient(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                authStorage.clearTokens();

                // Redirect to login page
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }

                httpLogger.error("Token refresh failed", refreshError);
                return Promise.reject(new AuthenticationError("Session expired"));
            } finally {
                isRefreshing = false;
            }
        }

        // Create appropriate error type
        const dataRecord = data as Record<string, unknown>;
        const errorMessage =
            (typeof dataRecord?.["message"] === "string" ? dataRecord["message"] : "") ||
            getErrorMessage(error);
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
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry auth errors or validation errors
            if (
                error instanceof AuthenticationError ||
                error instanceof AppError && error.statusCode < 500
            ) {
                throw error;
            }

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                httpLogger.debug(`Retrying request in ${delay}ms`, { attempt: attempt + 1 });
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Type-safe GET request
 */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await httpClient.get<T>(url, { params });
    return response.data;
}

/**
 * Type-safe POST request
 */
export async function post<T>(url: string, data?: unknown): Promise<T> {
    const response = await httpClient.post<T>(url, data);
    return response.data;
}

/**
 * Type-safe PUT request
 */
export async function put<T>(url: string, data?: unknown): Promise<T> {
    const response = await httpClient.put<T>(url, data);
    return response.data;
}

/**
 * Type-safe DELETE request
 */
export async function del<T>(url: string): Promise<T> {
    const response = await httpClient.delete<T>(url);
    return response.data;
}

// Export convenience methods
export const http = {
    client: httpClient,
    get,
    post,
    put,
    delete: del,
    withRetry,
};
