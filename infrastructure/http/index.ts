/**
 * Mô-đun HTTP - Lớp truy cập dữ liệu hợp nhất (Unified Data Access Layer)
 *
 * Tập trung hóa tất cả các tiện ích cho mọi hoạt động gọi API REST:
 * 1. Quản lý Token và tự động Refresh.
 * 2. Chuyển đổi (Adapting) dữ liệu Request và Response (CamelCase <-> SnakeCase).
 * 3. Ánh xạ lỗi API thô thành lỗi Domain (AppError).
 * 4. Logic Timeout, Retry và xác thực dữ liệu bằng Zod Schema.
 *
 * Mô-đun này đảm bảo tính nhất quán và dễ bảo trì cho toàn bộ lớp Repository.
 */

// Core HTTP client - Các hàm thực thi request chính
export { fetchWithToken, http, type FetchOptions } from './fetch-with-token';

// Request transformations - Chuyển đổi dữ liệu gửi đi
export {
  adaptRequest,
  adaptSearchParams,
  adaptProductSearchParams,
  adaptPaginationParams,
  createRequestAdapter,
  adaptRequests,
  type RequestAdapterOptions,
} from './request-adapter';

// Response transformations - Chuẩn hóa dữ liệu nhận về
export {
  adaptResponse,
  adaptListResponse,
  adaptPaginatedResponse,
  adaptResponseWithMapper,
  safeAdapt,
  isSuccessResponse,
  unwrapResponse,
  ApiResponseSchema,
  PaginatedResponseSchema,
} from './response-adapter';

// Error handling - Xử lý và phân loại lỗi
export {
  mapError,
  mapHttpError,
  shouldRetryError,
  isNetworkError,
  isAuthError,
  isValidationError,
  extractFieldErrors,
  getErrorMessageForUI,
  createErrorHandler,
  type BackendErrorResponse,
} from './api-error-mapper';

// No legacy client export
