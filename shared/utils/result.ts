/**
 * Result Type System
 *
 * Go-style Result pattern for consistent error handling across the application.
 * Provides type-safe success/error handling without throwing exceptions.
 * 
 * Moved from lib/result.ts to shared/utils/result.ts.
 */

/**
 * Success result containing data
 */
export interface Ok<T> {
    readonly ok: true;
    readonly data: T;
    readonly errors: null;
}

/**
 * Error result containing error messages
 */
export interface Err {
    readonly ok: false;
    readonly data: null;
    readonly errors: string[];
}

/**
 * Union type representing either success or failure
 */
export type Result<T> = Ok<T> | Err;

// ===========================================
// Result Constructors
// ===========================================

/**
 * Create a success result
 */
export function ok<T>(data: T): Ok<T> {
    return {
        ok: true,
        data,
        errors: null,
    };
}

/**
 * Create an error result
 */
export function err(errors: string | string[]): Err {
    return {
        ok: false,
        data: null,
        errors: Array.isArray(errors) ? errors : [errors],
    };
}

// ===========================================
// Result Utilities
// ===========================================

/**
 * Check if result is successful
 */
export function isOk<T>(result: Result<T>): result is Ok<T> {
    return result.ok === true;
}

/**
 * Check if result is an error
 */
export function isErr<T>(result: Result<T>): result is Err {
    return result.ok === false;
}

/**
 * Map over a successful result
 */
export function mapResult<T, U>(
    result: Result<T>,
    fn: (data: T) => U
): Result<U> {
    if (isOk(result)) {
        return ok(fn(result.data));
    }
    return result;
}

/**
 * Chain multiple Result-returning operations
 */
export function flatMapResult<T, U>(
    result: Result<T>,
    fn: (data: T) => Result<U>
): Result<U> {
    if (isOk(result)) {
        return fn(result.data);
    }
    return result;
}

/**
 * Unwrap result with default value for errors
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
    if (isOk(result)) {
        return result.data;
    }
    return defaultValue;
}

/**
 * Convert Promise to Result
 */
export async function tryCatch<T>(
    promise: Promise<T>,
    errorMessage?: string
): Promise<Result<T>> {
    try {
        const data = await promise;
        return ok(data);
    } catch (error) {
        const message =
            errorMessage ||
            (error instanceof Error ? error.message : "Unknown error occurred");
        return err(message);
    }
}

/**
 * Combine multiple results into a single result
 * Returns error if any result is an error
 */
export function combineResults<T extends readonly Result<unknown>[]>(
    results: T
): Result<{ [K in keyof T]: T[K] extends Result<infer U> ? U : never }> {
    const errors: string[] = [];
    const data: unknown[] = [];

    for (const result of results) {
        if (isErr(result)) {
            errors.push(...result.errors);
        } else {
            data.push(result.data);
        }
    }

    if (errors.length > 0) {
        return err(errors);
    }

    return ok(data as { [K in keyof T]: T[K] extends Result<infer U> ? U : never });
}

// ===========================================
// API Response Helpers
// ===========================================

/**
 * Backend API response structure
 */
export interface BackendResponse<T> {
    status: number;
    data: T;
    message: string;
}

/**
 * Convert backend response to Result
 */
export function fromBackendResponse<T>(
    response: BackendResponse<T>,
    successStatuses: number[] = [200, 201]
): Result<T> {
    if (successStatuses.includes(response.status)) {
        return ok(response.data);
    }
    return err(response.message || "Request failed");
}

/**
 * Parse API error response to Result
 */
export function fromApiError(error: unknown): Err {
    if (error instanceof Error) {
        return err(error.message);
    }
    if (typeof error === "string") {
        return err(error);
    }
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
    ) {
        const msg = (error as Record<string, unknown>)["message"];
        if (typeof msg === "string") {
            return err(msg);
        }
    }
    return err("An unexpected error occurred");
}
