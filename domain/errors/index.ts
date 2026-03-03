/**
 * Các Lớp Lỗi HTTP & Nghiệp vụ (Domain Errors)
 *
 * Định nghĩa hệ thống phân cấp lỗi (Error Hierarchy) giúp chuẩn hóa việc xử lý lỗi trong ứng dụng.
 * Tách biệt rõ ràng giữa lỗi mạng, lỗi xác thực, lỗi dữ liệu và lỗi hệ thống.
 * 
 * @example
 * try {
 *   await api.get('/products');
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     // Xử lý lỗi đăng nhập
 *   } else if (error instanceof NetworkError) {
 *     // Xử lý lỗi đường truyền
 *   }
 * }
 */

import { HTTP_STATUS } from "@/shared/constants";

// ===========================================
// Base App Error - Lớp lỗi cơ sở
// ===========================================

/**
 * Lớp lỗi gốc cho toàn bộ ứng dụng. 
 * Kế thừa từ class Error mặc định của JavaScript nhưng bổ sung thêm thông tin định danh.
 */
export class AppError extends Error {
    /** Mã lỗi máy tính đọc (Dùng để so khớp logic hoặc i18n) */
    public readonly code: string;
    /** Mã trạng thái HTTP tương ứng */
    public readonly statusCode: number;
    /** Dữ liệu chi tiết bổ sung (Payload của lỗi) */
    public readonly details: unknown;
    /** Thời điểm lỗi xảy ra */
    public readonly timestamp: string;

    constructor(
        message: string,
        code: string,
        statusCode: number = 500,
        details?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Giữ lại vết ngăn xếp (stack trace) chính xác nơi lỗi được ném ra
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Chuyển đổi lỗi sang dạng JSON để phục vụ ghi log hoặc serialize qua network
     */
    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
}

// ===========================================
// Network Errors - Lỗi kết nối & Đường truyền
// ===========================================

/** Lỗi do không có kết nối internet hoặc server không phản hồi */
export class NetworkError extends AppError {
    constructor(message: string = "Lỗi kết nối mạng", details?: unknown) {
        super(message, "NETWORK_ERROR", 0, details);
    }
}

/** Lỗi do yêu cầu kéo dài quá lâu (Timeout) */
export class TimeoutError extends AppError {
    constructor(
        message: string = "Yêu cầu quá hạn (Timeout)",
        timeoutMs?: number,
        details?: unknown
    ) {
        super(message, "TIMEOUT_ERROR", 408, { timeoutMs, ...details as object });
    }
}

// ===========================================
// Authentication Errors - Lỗi Xác thực & Quyền hạn
// ===========================================

/** Lỗi yêu cầu đăng nhập (401 Unauthorized) */
export class AuthenticationError extends AppError {
    constructor(
        message: string = "Yêu cầu xác thực tài khoản",
        details?: unknown
    ) {
        super(message, "AUTH_ERROR", HTTP_STATUS.UNAUTHORIZED, details);
    }
}

/** Lỗi do Token hết hạn sử dụng */
export class TokenExpiredError extends AppError {
    constructor(
        message: string = "Phiên làm việc đã hết hạn",
        details?: unknown
    ) {
        super(message, "TOKEN_EXPIRED", HTTP_STATUS.UNAUTHORIZED, details);
    }
}

/** Lỗi do người dùng không có quyền truy cập tài nguyên (403 Forbidden) */
export class ForbiddenError extends AppError {
    constructor(
        message: string = "Bạn không có quyền truy cập tài nguyên này",
        details?: unknown
    ) {
        super(message, "FORBIDDEN", HTTP_STATUS.FORBIDDEN, details);
    }
}

// ===========================================
// Validation Errors - Lỗi Dữ liệu đầu vào
// ===========================================

/** 
 * Lỗi 422 (Unprocessable Entity) thường dùng cho lỗi Form 
 * Chứa danh sách chi tiết các trường bị lỗi.
 */
export class ValidationError extends AppError {
    /** Danh sách lỗi chi tiết theo từng field (Tên field -> Mảng các thông báo lỗi) */
    public readonly fieldErrors: Record<string, string[]>;

    constructor(
        message: string = "Dữ liệu không hợp lệ",
        fieldErrors: Record<string, string[]> = {},
        details?: unknown
    ) {
        super(message, "VALIDATION_ERROR", HTTP_STATUS.UNPROCESSABLE_ENTITY, details);
        this.fieldErrors = fieldErrors;
    }

    /** Lấy mảng lỗi của một trường cụ thể */
    getFieldErrors(field: string): string[] {
        return this.fieldErrors[field] || [];
    }

    /** Kiểm tra xem một trường có bị lỗi hay không */
    hasFieldError(field: string): boolean {
        return (this.fieldErrors[field]?.length ?? 0) > 0;
    }

    /** Lấy danh sách tên tất cả các trường đang có lỗi */
    getErrorFields(): string[] {
        return Object.keys(this.fieldErrors);
    }
}

// ===========================================
// API Errors - Lỗi phản hồi từ Backend
// ===========================================

/** Lỗi chung chung khi gọi API nhưng không thuộc các nhóm đặc thù trên */
export class ApiError extends AppError {
    public readonly endpoint: string;
    public readonly method: string;

    constructor(
        message: string,
        statusCode: number,
        endpoint: string,
        method: string = "GET",
        details?: unknown
    ) {
        super(message, `API_ERROR_${statusCode}`, statusCode, details);
        this.endpoint = endpoint;
        this.method = method;
    }
}

/** Lỗi 404 (Not Found) - Không tìm thấy tài nguyên */
export class NotFoundError extends AppError {
    public readonly resourceType: string;
    public readonly resourceId: string | number | undefined;

    constructor(
        resourceType: string,
        resourceId?: string | number,
        details?: unknown
    ) {
        const message = resourceId
            ? `Không tìm thấy ${resourceType} với mã '${resourceId}'`
            : `Không tìm thấy ${resourceType}`;
        super(message, "NOT_FOUND", HTTP_STATUS.NOT_FOUND, details);
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
}

/** Lỗi 409 (Conflict) - Xung đột dữ liệu (VD: Trùng email đã đăng ký) */
export class ConflictError extends AppError {
    constructor(
        message: string = "Xung đột dữ liệu",
        details?: unknown
    ) {
        super(message, "CONFLICT", HTTP_STATUS.CONFLICT, details);
    }
}

/** Lỗi 500 (Internal Server Error) - Lỗi phát sinh từ phía Server */
export class ServerError extends AppError {
    constructor(
        message: string = "Lỗi hệ thống từ phía Server",
        details?: unknown
    ) {
        super(message, "SERVER_ERROR", HTTP_STATUS.INTERNAL_SERVER_ERROR, details);
    }
}

// ===========================================
// Error Factory - Bản đồ ánh xạ lỗi
// ===========================================

/**
 * Nhà máy tạo lỗi: Tự động chuyển đổi status code thành Type Error tương ứng.
 * Giúp code xử lý lỗi ngắn gọn và tường minh hơn.
 */
export function createHttpError(
    statusCode: number,
    message: string,
    details?: unknown
): AppError {
    switch (statusCode) {
        case HTTP_STATUS.UNAUTHORIZED:
            return new AuthenticationError(message, details);
        case HTTP_STATUS.FORBIDDEN:
            return new ForbiddenError(message, details);
        case HTTP_STATUS.NOT_FOUND:
            return new NotFoundError("Tài nguyên", undefined, details);
        case HTTP_STATUS.CONFLICT:
            return new ConflictError(message, details);
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
            return new ValidationError(message, {}, details);
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        case HTTP_STATUS.BAD_GATEWAY:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
            return new ServerError(message, details);
        default:
            return new ApiError(message, statusCode, "", "GET", details);
    }
}

// ===========================================
// Type Guards - Các hàm kiểm tra kiểu lỗi
// ===========================================

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

export function isAuthError(error: unknown): error is AuthenticationError | TokenExpiredError {
    return error instanceof AuthenticationError || error instanceof TokenExpiredError;
}

export function isNetworkError(error: unknown): error is NetworkError | TimeoutError {
    return error instanceof NetworkError || error instanceof TimeoutError;
}

// ===========================================
// Utilities - Tiện ích bóc tách lỗi
// ===========================================

/**
 * Lấy thông báo lỗi cuối cùng hiển thị cho người dùng từ bất kỳ kiểu dữ liệu lỗi nào.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
    ) {
        const msg = (error as Record<string, unknown>)["message"];
        if (typeof msg === "string") {
            return msg;
        }
    }
    return "Đã có lỗi không xác định xảy ra";
}

/**
 * Lấy mã hiệu lỗi (error code) để phục vụ logic i18n hoặc tracking log.
 */
export function getErrorCode(error: unknown): string {
    if (error instanceof AppError) {
        return error.code;
    }
    return "UNKNOWN_ERROR";
}
