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

import { z, ZodSchema } from 'zod';

import { AppError, AuthenticationError, NetworkError, TimeoutError } from '@/domain/errors';
import { authStorage } from '@/infrastructure/persistence/storage';
import { createScopedLogger } from '@/lib/logger';
import { HTTP_STATUS, REQUEST_CONFIG } from '@/shared/constants';

const logger = createScopedLogger('FetchWithToken');

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
  baseUrl: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000/api',
  timeout: REQUEST_CONFIG.TIMEOUT,
};

// ===========================================
// Helper Functions
// ===========================================

/**
 * Build complete URL with query parameters
 */
function buildUrl(baseUrl: string, endpoint: string, query?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(endpoint, baseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      // Skip undefined values
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
  try {
    return authStorage.getAccessToken();
  } catch {
    logger.error('Failed to retrieve access token');
    return null;
  }
}

/**
 * Get refresh token from storage
 */
async function getRefreshToken(): Promise<string | null> {
  try {
    return authStorage.getRefreshToken();
  } catch {
    logger.error('Failed to retrieve refresh token');
    return null;
  }
}

/**
 * Create fetch headers with authentication
 */
async function createHeaders(
  skipAuth: boolean = false,
  customHeaders?: Record<string, string>
): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

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
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    // 1. Lấy mã refresh token đang lưu trong bộ nhớ máy
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      logger.warn('No refresh token available');
      return false;
    }

    // 2. Gửi request POST lên endpoint refresh token của backend
    const response = await fetch(
      buildUrl(defaultConfig.baseUrl, '/auth/refresh-token'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }
    );

    // Nếu server từ chối làm mới (refresh token hết hạn/vô hiệu)
    if (!response.ok) {
      logger.error('Token refresh failed', { status: response.status });
      return false;
    }

    // 3. Trích xuất cặp token mới từ body response
    const data = await response.json();
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data || data;

    // 4. Cập nhật chúng vào Storage để dùng cho các request tiếp theo
    authStorage.setTokens(newAccessToken, newRefreshToken || refreshToken);
    return true;
  } catch (error) {
    // Xử lý lỗi runtime (mạng lag, server sập giữa chừng) trong quá trình refresh
    logger.error('Token refresh error', error);
    return false;
  }
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
    try {
      return schema.parse(data);
    } catch (validationError) {
      logger.error('Response validation failed', { validationError, data });
      throw new Error('Invalid server response format');
    }
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

      // Tạo Headers chứa Content-Type và Authentication nếu cần
      const headers = await createHeaders(skipAuth, customHeaders);

      // Cấu hình ngắt request nếu quá thời gian (Timeout handling)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // Thực thi request HTTP thực tế thông qua Fetch API chuẩn
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : null, // Dùng null thay cho undefined để khớp kiểu BodyInit
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // KỊCH BẢN ĐẶC BIỆT: Token hết hạn (401)
        if (response.status === HTTP_STATUS.UNAUTHORIZED && !skipAuth && attempt === 1) {
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
        const validated = await validateResponse(response, schema) as TResponse;
        logger.debug(`Success ${method} ${endpoint}`);

        return validated;
      } catch (error) {
        clearTimeout(timeoutId);

        // Ném lỗi timeout cụ thể nếu bị trigger bởi AbortController
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new TimeoutError(`Request timeout after ${timeout}ms`, timeout);
        }

        throw error;
      }
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
