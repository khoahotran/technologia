/**
 * HTTP Error Classes
 *
 * Typed error classes for different HTTP/API error scenarios.
 * Enables consistent error handling and proper error classification.
 *
 * @example
 * try {
 *   await api.get('/products');
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     redirectToLogin();
 *   } else if (error instanceof NetworkError) {
 *     showRetryMessage();
 *   }
 * }
 */

import { HTTP_STATUS } from "@/shared/constants";

// ===========================================
// Base App Error
// ===========================================

export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details: unknown;
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

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Convert to JSON for logging/serialization
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
// Network Errors
// ===========================================

export class NetworkError extends AppError {
    constructor(message: string = "Network error occurred", details?: unknown) {
        super(message, "NETWORK_ERROR", 0, details);
    }
}

export class TimeoutError extends AppError {
    constructor(
        message: string = "Request timed out",
        timeoutMs?: number,
        details?: unknown
    ) {
        super(message, "TIMEOUT_ERROR", 408, { timeoutMs, ...details as object });
    }
}

// ===========================================
// Authentication Errors
// ===========================================

export class AuthenticationError extends AppError {
    constructor(
        message: string = "Authentication required",
        details?: unknown
    ) {
        super(message, "AUTH_ERROR", HTTP_STATUS.UNAUTHORIZED, details);
    }
}

export class TokenExpiredError extends AppError {
    constructor(
        message: string = "Token has expired",
        details?: unknown
    ) {
        super(message, "TOKEN_EXPIRED", HTTP_STATUS.UNAUTHORIZED, details);
    }
}

export class ForbiddenError extends AppError {
    constructor(
        message: string = "Access forbidden",
        details?: unknown
    ) {
        super(message, "FORBIDDEN", HTTP_STATUS.FORBIDDEN, details);
    }
}

// ===========================================
// Validation Errors
// ===========================================

export class ValidationError extends AppError {
    public readonly fieldErrors: Record<string, string[]>;

    constructor(
        message: string = "Validation failed",
        fieldErrors: Record<string, string[]> = {},
        details?: unknown
    ) {
        super(message, "VALIDATION_ERROR", HTTP_STATUS.UNPROCESSABLE_ENTITY, details);
        this.fieldErrors = fieldErrors;
    }

    /**
     * Get errors for a specific field
     */
    getFieldErrors(field: string): string[] {
        return this.fieldErrors[field] || [];
    }

    /**
     * Check if a specific field has errors
     */
    hasFieldError(field: string): boolean {
        return (this.fieldErrors[field]?.length ?? 0) > 0;
    }

    /**
     * Get all field names with errors
     */
    getErrorFields(): string[] {
        return Object.keys(this.fieldErrors);
    }
}

// ===========================================
// API Errors
// ===========================================

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

export class NotFoundError extends AppError {
    public readonly resourceType: string;
    public readonly resourceId: string | number | undefined;

    constructor(
        resourceType: string,
        resourceId?: string | number,
        details?: unknown
    ) {
        const message = resourceId
            ? `${resourceType} with ID '${resourceId}' not found`
            : `${resourceType} not found`;
        super(message, "NOT_FOUND", HTTP_STATUS.NOT_FOUND, details);
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
}

export class ConflictError extends AppError {
    constructor(
        message: string = "Resource conflict",
        details?: unknown
    ) {
        super(message, "CONFLICT", HTTP_STATUS.CONFLICT, details);
    }
}

export class ServerError extends AppError {
    constructor(
        message: string = "Internal server error",
        details?: unknown
    ) {
        super(message, "SERVER_ERROR", HTTP_STATUS.INTERNAL_SERVER_ERROR, details);
    }
}

// ===========================================
// Error Factory
// ===========================================

/**
 * Create appropriate error from HTTP status code
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
            return new NotFoundError("Resource", undefined, details);
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

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Type guard to check if error is an authentication error
 */
export function isAuthError(error: unknown): error is AuthenticationError | TokenExpiredError {
    return error instanceof AuthenticationError || error instanceof TokenExpiredError;
}

/**
 * Type guard to check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError | TimeoutError {
    return error instanceof NetworkError || error instanceof TimeoutError;
}

/**
 * Extract error message from any error type
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
    return "An unexpected error occurred";
}

/**
 * Extract error code from any error type
 */
export function getErrorCode(error: unknown): string {
    if (error instanceof AppError) {
        return error.code;
    }
    return "UNKNOWN_ERROR";
}
