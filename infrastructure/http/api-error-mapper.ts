/**
 * Cổng chuyển đổi lỗi API
 *
 * Chuyển đổi các lỗi HTTP/Backend thành các lỗi Domain đã được định nghĩa kiểu (typed domain errors)
 * để đảm bảo việc xử lý lỗi đồng nhất trong toàn bộ ứng dụng.
 *
 * Tầng này đảm bảo rằng các thông báo lỗi có ý nghĩa và có thể thực hiện hành động khắc phục
 * ở cấp độ ứng dụng (Application Layer).
 */

import { HTTP_STATUS } from '@/shared/constants';
import {
  AppError,
  AuthenticationError,
  TokenExpiredError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServerError,
  ValidationError,
  NetworkError,
  TimeoutError,
  isAppError,
} from '@/domain/errors';
import { createScopedLogger } from '@/lib/logger';

const logger = createScopedLogger('ErrorMapper');

// ===========================================
// Types
// ===========================================

/** Cấu trúc phản hồi lỗi mặc định từ phía Backend */
export interface BackendErrorResponse {
  /** Mã trạng thái HTTP */
  status: number;
  /** Thông báo lỗi ngắn gọn */
  message?: string;
  /** Tên loại lỗi (ví dụ: Bad Request) */
  error?: string;
  /** Chi tiết lỗi từng trường (cho ValidationError) */
  errors?: Record<string, string | string[]>;
  /** Dữ liệu bổ sung đi kèm lỗi */
  details?: unknown;
}

// ===========================================
// Error Mapping
// ===========================================

/**
 * Ánh xạ mã HTTP status sang lớp Error Domain tương ứng
 */
function mapHttpStatusToError(
  statusCode: number,
  message: string,
  details?: unknown
): AppError {
  switch (statusCode) {
    case HTTP_STATUS.UNAUTHORIZED:
      // 401: Chân thực hóa thành lỗi xác thực
      return new AuthenticationError(message, details);

    case HTTP_STATUS.FORBIDDEN:
      // 403: Chân thực hóa thành lỗi cấm truy cập
      return new ForbiddenError(message, details);

    case HTTP_STATUS.NOT_FOUND:
      // 404: Chân thực hóa thành lỗi không tìm thấy tài nguyên
      return new NotFoundError('Resource', undefined, details);

    case HTTP_STATUS.CONFLICT:
      // 409: Thường xảy ra khi trùng Email/Username trong DB
      return new ConflictError(message, details);

    case HTTP_STATUS.UNPROCESSABLE_ENTITY: {
      // 422: Lỗi validation dữ liệu input (Laravel/Go thường dùng mã này)
      // Tiến hành bóc tách lỗi từng trường từ mảng details
      const fieldErrors = parseFieldErrors(details);
      return new ValidationError(message, fieldErrors, details);
    }

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      // 5xx: Lỗi nghiêm trọng phía máy chủ
      return new ServerError(message, details);

    default:
      // Các mã lỗi khác được bọc trong AppError cơ bản
      return new AppError(message, `HTTP_ERROR_${statusCode}`, statusCode, details);
  }
}

/**
 * Trích xuất lỗi từng trường từ dữ liệu details của API
 */
function parseFieldErrors(details: unknown): Record<string, string[]> {
  // Nếu details không phải object, không có gì để parse
  if (!details || typeof details !== 'object') {
    return {};
  }

  const parsed: Record<string, string[]> = {};
  const obj = details as Record<string, unknown>;

  // Trường hợp 1: API trả về object có key "errors" chứa object con
  if (obj['errors'] && typeof obj['errors'] === 'object') {
    const errors = obj['errors'] as Record<string, unknown>;
    for (const [field, messages] of Object.entries(errors)) {
      if (Array.isArray(messages)) {
        // Chuyển mảng tin nhắn về string tập trung
        parsed[field] = messages.map(String);
      } else if (typeof messages === 'string') {
        // Đóng gói string đơn lẻ vào mảng
        parsed[field] = [messages];
      }
    }
  }

  // Trường hợp 2: API trả về cấu trúc phẳng (flat structure)
  for (const [key, value] of Object.entries(obj)) {
    if (key !== 'errors' && typeof value === 'string') {
      parsed[key] = [value];
    }
  }

  return parsed;
}

/**
 * Trích xuất nội dung tin nhắn lỗi từ nhiều nguồn khác nhau (Error object, string, object body)
 */
function extractErrorMessage(error: unknown): string {
  // Nếu là instance Error chuẩn của JS
  if (error instanceof Error) {
    return error.message;
  }

  // Nếu throw ra một chuỗi thô
  if (typeof error === 'string') {
    return error;
  }

  // Nếu là object tùy chỉnh (thường là body response từ Axios)
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;

    // Kiểm tra các trường chứa message phổ biến
    if (typeof obj['message'] === 'string') {
      return obj['message'];
    }
    if (typeof obj['error'] === 'string') {
      return obj['error'];
    }
    if (typeof obj['detail'] === 'string') {
      return obj['detail'];
    }
  }

  // Fallback nếu không xác định được
  return 'An unexpected error occurred';
}

// ===========================================
// Main Mapper Function
// ===========================================

/**
 * Hàm chính để chuyển đổi BẤT KỲ loại lỗi nào sang AppError của Domain
 */
export function mapError(error: unknown, context?: string): AppError {
  // Nếu đã được chuyển đổi từ trước (isAppError), trả về luôn
  if (isAppError(error)) {
    return error;
  }

  // Xử lý lỗi kết nối mạng (Fetch TypeError)
  if (error instanceof TypeError) {
    if (error.message.includes('Failed to fetch')) {
      return new NetworkError('Network error - please check your connection', { context, original: error });
    }
  }

  // Xử lý lỗi quá hạn timeout (Abort signal từ AbortController)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new TimeoutError('Request timeout', 30000, { context });
  }

  // Ghi log lại các lỗi chưa được ánh xạ tường minh để debug sau này
  const message = extractErrorMessage(error);
  logger.error(`Unmapped error${context ? ` in ${context}` : ''}`, { message, original: error });

  // Khởi tạo một AppError chung chung với mã UNMAPPED_ERROR
  return new AppError(message, 'UNMAPPED_ERROR', 500, error);
}

/**
 * Map HTTP response error to domain error
 *
 * Expects backend error response structure
 *
 * @example
 * const response = await fetch(...);
 * if (!response.ok) {
 *   const errorData = await response.json();
 *   throw mapHttpError(response.status, errorData);
 * }
 */
export function mapHttpError(
  statusCode: number,
  errorData: unknown,
  context?: string
): AppError {
  // Parse error response
  const errorResponse = errorData as BackendErrorResponse | null;
  const message = errorResponse?.message || extractErrorMessage(errorData);

  // Log error
  logger.error(`HTTP error ${statusCode}${context ? ` in ${context}` : ''}`, {
    statusCode,
    message,
    details: errorResponse?.details,
  });

  // Map to domain error
  return mapHttpStatusToError(statusCode, message, errorResponse?.details);
}

/**
 * Check if error is retryable
 *
 * Non-retryable:
 * - Authentication errors (401, token expired)
 * - Validation errors (400, field validation)
 * - Not found errors (404)
 * - Forbidden errors (403)
 *
 * Retryable:
 * - Network errors
 * - Timeout errors
 * - Server errors (5xx)
 *
 * @example
 * if (shouldRetryError(error)) {
 *   setTimeout(() => retry(), 1000);
 * }
 */
export function shouldRetryError(error: AppError | unknown): boolean {
  const appError = isAppError(error) ? error : mapError(error);

  // Never retry auth errors
  if (appError instanceof AuthenticationError || appError instanceof TokenExpiredError) {
    return false;
  }

  // Never retry validation errors
  if (appError instanceof ValidationError) {
    return false;
  }

  // Never retry not found/forbidden
  if (appError instanceof NotFoundError || appError instanceof ForbiddenError) {
    return false;
  }

  // Always retry network/timeout
  if (appError instanceof NetworkError || appError instanceof TimeoutError) {
    return true;
  }

  // Retry server errors (5xx)
  return appError.statusCode >= 500;
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  const appError = isAppError(error) ? error : mapError(error);
  return appError instanceof NetworkError || appError instanceof TimeoutError;
}

/**
 * Check if error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  const appError = isAppError(error) ? error : mapError(error);
  return appError instanceof AuthenticationError || appError instanceof TokenExpiredError;
}

/**
 * Check if error is validation-related
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ValidationError;
}

/**
 * Extract field-level validation errors
 *
 * @example
 * const fieldErrors = extractFieldErrors(error);
 * setFormErrors(fieldErrors);
 */
export function extractFieldErrors(error: unknown): Record<string, string[]> {
  if (error instanceof ValidationError) {
    return error.fieldErrors;
  }
  return {};
}

/**
 * Convert error to user-friendly message
 *
 * For UI display, hiding implementation details
 */
export function getErrorMessageForUI(error: AppError | unknown): string {
  const appError = isAppError(error) ? error : mapError(error);

  // Specific messages by error type
  if (appError instanceof NetworkError) {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  if (appError instanceof TimeoutError) {
    return 'Request took too long. Please try again.';
  }

  if (appError instanceof AuthenticationError) {
    return 'Your session has expired. Please log in again.';
  }

  if (appError instanceof ForbiddenError) {
    return 'You do not have permission to perform this action.';
  }

  if (appError instanceof NotFoundError) {
    return 'The requested resource was not found.';
  }

  if (appError instanceof ServerError) {
    return 'Server error. Please try again later.';
  }

  if (appError instanceof ValidationError) {
    return appError.message || 'Please check your input and try again.';
  }

  // Default message
  return appError.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Create typed error handler factory
 *
 * @example
 * const handleProductError = createErrorHandler({
 *   onAuth: () => redirectToLogin(),
 *   onValidation: (errors) => setFormErrors(errors),
 *   onNotFound: () => setShowNotFound(true),
 * });
 *
 * try {
 *   await api.get('/product');
 * } catch (error) {
 *   handleProductError(error);
 * }
 */
export function createErrorHandler(handlers: {
  onAuth?: (error: AuthenticationError) => void;
  onValidation?: (error: ValidationError) => void;
  onNetwork?: (error: NetworkError | TimeoutError) => void;
  onNotFound?: (error: NotFoundError) => void;
  onServer?: (error: ServerError) => void;
  onDefault?: (error: AppError) => void;
}) {
  return (error: unknown) => {
    const appError = isAppError(error) ? error : mapError(error);

    if (appError instanceof AuthenticationError && handlers.onAuth) {
      handlers.onAuth(appError);
    } else if (appError instanceof ValidationError && handlers.onValidation) {
      handlers.onValidation(appError);
    } else if ((appError instanceof NetworkError || appError instanceof TimeoutError) && handlers.onNetwork) {
      handlers.onNetwork(appError as NetworkError | TimeoutError);
    } else if (appError instanceof NotFoundError && handlers.onNotFound) {
      handlers.onNotFound(appError);
    } else if (appError instanceof ServerError && handlers.onServer) {
      handlers.onServer(appError);
    } else if (handlers.onDefault) {
      handlers.onDefault(appError);
    }
  };
}
