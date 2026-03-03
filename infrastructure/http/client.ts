/**
 * HTTP Client (Axois Implementation)
 *
 * Client HTTP trung tâm dựa trên thư viện Axios, tích hợp sẵn các tính năng:
 * 1. Tự động đính kèm Access Token vào Header của request.
 * 2. Cơ chế tự động làm mới Token (Refresh Token) khi gặp lỗi 401.
 * 3. Hàng đợi (Queue) xử lý các request song song khi đang refresh token.
 * 4. Interceptors để ghi log, theo dõi Request ID (X-Request-ID).
 * 5. Chiến lược Retry với Exponential Backoff (Thử lại với độ trễ tăng dần).
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
// Configuration - Cấu hình cơ bản
// ===========================================

const BASE_URL = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3000/api";
const httpLogger = createScopedLogger("HTTP");

// ===========================================
// Create Axios Instance - Khởi tạo thực thể Axios
// ===========================================

/**
 * httpClient là thực thể Axios dùng chung cho toàn bộ ứng dụng.
 * Được cấu hình sẵn các giá trị mặc định về timeout và content-type.
 */
export const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": REQUEST_CONFIG.JSON_CONTENT_TYPE,
    },
    timeout: REQUEST_CONFIG.TIMEOUT,
});

// ===========================================
// Token Refresh State - Quản lý trạng thái Refresh Token
// ===========================================

/**
 * Giao diện đại diện cho một Request bị kẹt trong hàng chờ khi đang Refresh
 */
interface FailedRequest {
    resolve: (token: string) => void; // Hàm gọi khi đã có token mới thành công
    reject: (error: unknown) => void; // Hàm gọi khi refresh token thất bại hoàn toàn
}

// Cờ đánh dấu hệ thống đang thực hiện một lệnh Refresh Token lên Server
let isRefreshing = false;
// Danh sách các request đang "xếp hàng" chờ lấy token mới để được thực thi lại
let failedQueue: FailedRequest[] = [];

/**
 * Xử lý hàng đợi sau khi Refresh lệnh thành công hoặc thất bại
 * 
 * @param error Lỗi phát sinh nếu refresh thất bại
 * @param token Token mới nếu refresh thành công
 */
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
// Request Interceptor - Bộ chặn yêu cầu đầu ra
// ===========================================

httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Tạo một ID duy nhất cho mỗi Request để dễ dàng Trace log trên cả Frontend và Backend
        const requestId = crypto.randomUUID?.() || Date.now().toString();
        config.headers.set("X-Request-ID", requestId);

        // Tự động lấy Access Token từ kho lưu giữ (localStorage/Cookie)
        const token = authStorage.getAccessToken();
        if (token) {
            // Đính kèm token vào header Authorization theo chuẩn Bearer
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Ghi log chi tiết Request ở môi trường Development
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
// Response Interceptor - Bộ chặn phản hồi đầu vào
// ===========================================

httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Ghi log phản hồi thành công ở môi trường Dev
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

        // Bước 1: Xử lý lỗi hệ thống/mạng (Không có response từ server)
        if (!error.response) {
            if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
                return Promise.reject(new TimeoutError("Yêu cầu quá thời gian phản hồi", REQUEST_CONFIG.TIMEOUT));
            }
            return Promise.reject(new NetworkError("Lỗi kết nối mạng - vui lòng kiểm tra đường truyền"));
        }

        const { status, data } = error.response;

        // Bước 2: Ghi log lỗi từ API để theo dõi
        httpLogger.error("API Error", error, {
            status,
            url: originalRequest?.url,
            message: (data as Record<string, unknown>)?.["message"],
        });

        // Bước 3: Logic tự động Refresh Token khi gặp lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
        const isAuthRoute = originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh-token");

        if ((status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN) && !originalRequest._retry && !isAuthRoute) {

            // THA: Đã có một request khác đang tiến hành refresh token
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    // Đưa request hiện tại vào hàng chờ xếp hàng
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        // Nhận được token mới từ Queue, gắn vào header và thực thi lại request gốc
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = "Bearer " + token;
                        }
                        return httpClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // THB: Đây là request đầu tiên phát hiện token hết hiệu lực
            originalRequest._retry = true; // Đánh dấu để tránh lặp vô tận (Infinite loop)
            isRefreshing = true; // Khóa Refresh lại

            const refreshToken = authStorage.getRefreshToken();

            // Nếu không tìm thấy Refresh Token -> Không thể cứu vãn, yêu cầu đăng nhập lại
            if (!refreshToken) {
                authStorage.clearTokens();
                processQueue(new AuthenticationError("Không tìm thấy Refresh Token"), null);
                isRefreshing = false;
                if (typeof window !== "undefined") {
                    window.location.href = "/login?error=session_expired";
                }
                return Promise.reject(new AuthenticationError("Yêu cầu xác thực lại"));
            }

            try {
                // Gửi request xin token mới bằng Refresh Token hiện có
                const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

                // Cập nhật token mới vào kho lưu trữ
                authStorage.setTokens(newAccessToken, newRefreshToken || refreshToken);
                // Cập nhật token mặc định cho instance axios
                httpClient.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken;

                // Thông báo cho toàn bộ request đang chờ trong Queue là "Đã có hàng mới"
                processQueue(null, newAccessToken);

                // Gắn token mới cho request hiện tại và thực thi lại nó
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = "Bearer " + newAccessToken;
                }
                return httpClient(originalRequest);

            } catch (refreshError) {
                // Nếu refresh thất bại (Token hết hạn thực sự) -> Buộc phải Logout người dùng
                processQueue(refreshError, null);
                authStorage.clearTokens();
                if (typeof window !== "undefined") {
                    window.location.href = "/login?error=session_expired";
                }
                return Promise.reject(new AuthenticationError("Phiên đăng nhập đã hết hạn"));
            } finally {
                isRefreshing = false; // Mở khóa Refresh cho các đợt tiếp theo
            }
        }

        // Bước 4: Chuyển đổi lỗi API thô thành Domain Errors (AppError)
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
// Helper Methods - Các phương thức tiện ích
// ===========================================

/**
 * Thực hiện lại một hành động không đồng bộ n lần nếu gặp lỗi server (5xx)
 * Sử dụng thuật toán Exponential Backoff: Thời gian chờ = baseDelay * 2^lần_thử
 * 
 * @param fn Hàm thực thi logic (VD: gọi API)
 * @param maxRetries Số lần thử lại tối đa (Mặc định 2)
 * @param baseDelay Thời gian chờ cơ sở (Mặc định 1000ms)
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
            // Không retry nếu lỗi thuộc về phía Client (4xx) hoặc lỗi Xác thực
            if (error instanceof AuthenticationError || (error instanceof AppError && error.statusCode < 500)) {
                throw error;
            }

            // Nếu chưa hết lượt -> Chờ một lúc rồi thử lại
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}

/**
 * Các phương thức HTTP Type-safe tiện dụng cho việc gọi API nhanh
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

/**
 * Đối tượng http xuất khẩu cung cấp giao diện lập trình hướng hàm (Functional)
 * Hữu ích để thay thế cho việc gọi trực tiếp httpClient khi không cần can thiệp sâu vào config request.
 */
export const http = {
    client: httpClient,
    get,
    post,
    put,
    delete: del,
    withRetry,
};
