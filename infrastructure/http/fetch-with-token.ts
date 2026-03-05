/**
 * Fetch with Token Utility
 *
 * Unified HTTP request handler with:
 * - Automatic token management (refresh, fallback)
 * - Request/response validation with Zod
 * - Consistent error mapping to domain errors
 * - Timeout handling
 * - SSR-safe cookie access
 *
 * This replaces ad-hoc fetch calls throughout the codebase
 * ensuring consistency and maintainability.
 */

import { ZodSchema } from 'zod';

import { AppError, AuthenticationError, NetworkError, TimeoutError } from '@/domain/errors';
import { authStorage } from '@/infrastructure/persistence/storage';
import { createScopedLogger } from '@/lib/logger';
import { HTTP_STATUS, REQUEST_CONFIG } from '@/shared/constants';
import { safe, safeSync } from '@/shared/utils/result';

const logger = createScopedLogger('FetchWithToken');

// ===========================================
// Global State for Token Refresh Concurrency
// ===========================================
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// ===========================================
// Types
// ===========================================

export interface FetchOptions<TResponse extends ZodSchema = ZodSchema> {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** Request body (will be JSON stringified) */
  body?: unknown;

  /** Query parameters to append to URL */
  query?: Record<string, string | number | boolean | undefined>;

  /** Custom headers to merge */
  headers?: Record<string, string>;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Zod schema to validate response */
  schema?: TResponse;

  /** Skip auth header (for login/register endpoints) */
  skipAuth?: boolean;

  /** Retry logic */
  retries?: number;
  retryDelay?: number;
}

export interface RequestConfig {
  baseUrl: string;
  timeout: number;
}

// ===========================================
// Configuration
// ===========================================

export const defaultConfig: RequestConfig = {
  // Đảm bảo baseUrl luôn kết thúc bằng / để URL constructor hoạt động chính xác với paths tương đối
  baseUrl: (process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000/api').replace(/\/?$/, '/'),
  timeout: REQUEST_CONFIG.TIMEOUT,
};

// ===========================================
// Helper Functions
// ===========================================

/**
 * Build complete URL with query parameters
 */
function buildUrl(baseUrl: string, endpoint: string, query?: Record<string, string | number | boolean | undefined>): string {
  // Loại bỏ dấu gạch chéo ở đầu endpoint nếu có để tránh bị URL constructor hiểu là đường dẫn gốc (Root path)
  const relativePath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = new URL(relativePath, baseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Get access token from storage (SSR-safe)
 */
async function getAccessToken(): Promise<string | null> {
  const [token, error] = safeSync(() => authStorage.getAccessToken());
  if (error) {
    logger.error('Failed to retrieve access token');
    return null;
  }
  return token;
}

/**
 * Get refresh token from storage
 */
async function getRefreshToken(): Promise<string | null> {
  const [token, error] = safeSync(() => authStorage.getRefreshToken());
  if (error) {
    logger.error('Failed to retrieve refresh token');
    return null;
  }
  return token;
}

/**
 * Create fetch headers with authentication
 */
async function createHeaders(
  skipAuth: boolean = false,
  customHeaders?: Record<string, string>,
  isFormData: boolean = false
): Promise<HeadersInit> {
  const headers: Record<string, string> = {};

  // Chỉ set Content-Type JSON nếu KHÔNG PHẢI FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return { ...headers, ...customHeaders };
}

/**
 * Thử thực hiện làm mới access token bằng refresh token
 * Sử dụng cơ chế khóa (Lock) để tránh nhiều request refresh cùng lúc
 */
async function refreshAccessToken(): Promise<boolean> {
  // Nếu đã có một tiến trình refresh đang chạy, trả về promise đó
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    // 1. Lấy mã refresh token đang lưu trong bộ nhớ máy (Go-style handling)
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      logger.warn('No refresh token available');
      return false;
    }

    // 2. Gửi request POST lên endpoint refresh token (Go-style handling)
    const [response, fetchError] = await safe(fetch(
      buildUrl(defaultConfig.baseUrl, '/auth/refresh-token'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }
    ));

    if (fetchError || !response?.ok) {
      logger.error('Token refresh failed', { status: response?.status, error: fetchError });
      isRefreshing = false;
      refreshPromise = null;
      return false;
    }

    // 3. Trích xuất cặp token mới từ body response
    const [data, jsonError] = await safe(response.json());
    if (jsonError) {
      logger.error('Token refresh JSON parse error', jsonError);
      isRefreshing = false;
      refreshPromise = null;
      return false;
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data || data;

    // 4. Cập nhật chúng vào Storage
    authStorage.setTokens(newAccessToken, newRefreshToken || refreshToken);
    isRefreshing = false;
    refreshPromise = null;
    return true;
  })();

  return refreshPromise;
}

/**
 * Validate response status and type
 */
async function validateResponse(
  response: Response,
  schema?: ZodSchema
): Promise<unknown> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();

  // Validate with schema if provided
  if (schema) {
    const [parsed, validationError] = safeSync(() => schema.parse(data));
    if (validationError) {
      logger.error('Response validation failed', { validationError, data });
      throw new Error('Invalid server response format');
    }
    return parsed;
  }

  return data;
}

// ===========================================
// Main Fetch Function with Retry Logic
// ===========================================

/**
 * Bản fetch có định kiểu, tự động xử lý Token và cơ chế Retry
 *
 * Tính năng nổi bật:
 * - Tự động đính kèm Bearer token vào Headers
 * - Tự động thử làm mới Token nếu nhận mã 401
 * - Kiểm tra dữ liệu trả về thông qua Zod Schema
 * - Cơ chế thử lại (Retry) với độ trễ lũy thừa (Exponential Backoff)
 */
export async function fetchWithToken<TResponse = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<TResponse> {
  // Phân tách các tham số cấu hình request
  const {
    method = 'GET',
    body,
    query,
    headers: customHeaders,
    timeout = defaultConfig.timeout,
    schema,
    skipAuth = false,
    retries = 0,
    retryDelay = 1000,
  } = options;

  let lastError: AppError | null = null;
  let attempt = 0;

  // Vòng lặp xử lý Retry: Chạy ít nhất 1 lần và tối đa (1 + số lần retry mong muốn)
  while (attempt <= retries) {
    try {
      attempt++;

      // Khởi tạo URL hoàn chỉnh kèm query string
      const url = buildUrl(defaultConfig.baseUrl, endpoint, query);
      logger.debug(`Fetching ${method} ${endpoint}`, { attempt, retries });

      // Kiểm tra xem body có phải FormData không
      const isFormData = body instanceof FormData;

      // Tạo Headers chứa Content-Type và Authentication nếu cần
      const headers = await createHeaders(skipAuth, customHeaders, isFormData);

      // Cấu hình ngắt request nếu quá thời gian (Timeout handling)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const [response, fetchError] = await safe(fetch(url, {
        method,
        headers,
        body: body
          ? (isFormData ? body : JSON.stringify(body))
          : null,
        signal: controller.signal,
      }));

      clearTimeout(timeoutId);

      if (fetchError !== null) {
        // Ném lỗi timeout cụ thể nếu bị trigger bởi AbortController
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          throw new TimeoutError(`Request timeout after ${timeout}ms`, timeout);
        }
        throw fetchError;
      }

      // KỊCH BẢN ĐẶC BIỆT: Token hết hạn (401) hoặc bị từ chối quyền (403)
      if ((response!.status === HTTP_STATUS.UNAUTHORIZED || response!.status === HTTP_STATUS.FORBIDDEN) && !skipAuth && attempt === 1) {
        logger.debug('Token expired, attempting refresh');
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          // Nếu làm mới token thành công, thực hiện ĐỆ QUY (lần duy nhất) để thử lại request gốc với token mới
          return fetchWithToken<TResponse>(endpoint, {
            ...options,
            retries: 0, // Quan trọng: Reset retry về 0 để tránh vòng lặp vô tận
          });
        }

        // Thất bại trong việc làm mới: Cưỡng chế đăng xuất bằng cách xóa tokens và báo lỗi
        authStorage.clearTokens();
        throw new AuthenticationError('Session expired');
      }

      // Kiểm tra mã trạng thái HTTP (2xx) và parse JSON + Zod verification
      const validated = await validateResponse(response!, schema) as TResponse;
      logger.debug(`Success ${method} ${endpoint}`);

      return validated;
    } catch (error) {
      // CHUYỂN ĐỔI LỖI: Gom tất cả các loại exception về AppError thống nhất
      if (error instanceof AppError) {
        lastError = error;
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        lastError = new NetworkError('Network error - please check your connection');
      } else if (error instanceof SyntaxError) {
        lastError = new AppError('Invalid server response', 'INVALID_RESPONSE', 500, error);
      } else {
        lastError = new AppError(
          error instanceof Error ? error.message : 'Unknown error',
          'FETCH_ERROR',
          500,
          error
        );
      }

      // XỬ LÝ RETRY: Nếu lỗi có thể hồi phục (ví dụ lỗi mạng, lỗi server 5xx) và vẫn còn lượt thử
      if (attempt <= retries && shouldRetry(lastError)) {
        // Áp dụng thuật toán Exponential Backoff: delay * 2^(attempt-1)
        const delay = retryDelay * Math.pow(2, attempt - 1);
        logger.debug(`Retrying after ${delay}ms`, { attempt, maxAttempts: retries });

        // Tạm dừng execution trong khoảng thời gian delay trước khi lặp lại vòng while
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Nếu không thuộc diện retry hoặc hết lượt, ném lỗi ra ngoài cho UI/Store xử lý
      throw lastError;
    }
  }

  throw lastError || new AppError('Fetch failed', 'FETCH_ERROR', 500);
}

/**
 * Determine if error is retryable
 */
function shouldRetry(error: AppError): boolean {
  // Don't retry auth/validation errors
  if (error instanceof AuthenticationError) {
    return false;
  }

  // Retry network and timeout errors
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }

  // Retry 5xx errors
  if (error.statusCode >= 500) {
    return true;
  }

  return false;
}

// ===========================================
// Convenience Methods
// ===========================================

export const http = {
  async get<T = unknown>(
    endpoint: string,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ): Promise<T> {
    return fetchWithToken<T>(endpoint, { ...options, method: 'GET' });
  },

  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ): Promise<T> {
    return fetchWithToken<T>(endpoint, { ...options, method: 'POST', body });
  },

  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ): Promise<T> {
    return fetchWithToken<T>(endpoint, { ...options, method: 'PUT', body });
  },

  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ): Promise<T> {
    return fetchWithToken<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  async delete<T = unknown>(
    endpoint: string,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ): Promise<T> {
    return fetchWithToken<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
