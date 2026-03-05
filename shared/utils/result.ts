/**
 * Hệ thống Phân loại Kết quả (Result Type System)
 *
 * Áp dụng pattern Result giống ngôn ngữ Go hoặc Rust để xử lý lỗi nhất quán toàn ứng dụng.
 * Cung cấp giải pháp an toàn kiểu dữ liệu (type-safe) để quản lý thành công / thất bại
 * mà KHÔNG cần dùng Try/Catch loạn xạ (throw exceptions).
 */

/**
 * Kiểu dữ liệu Tuple theo phong cách Go: [Data | null, Error | null]
 */
export type GoResult<T, E = unknown> = [T, null] | [null, E];

/**
 * Pattern Go-style: Trả về một tuple [data, error]
 * Giúp code gọn gàng hơn, không cần bọc try-catch liên tục.
 * Cách dùng: const [data, err] = await safe(promise);
 */
export async function safe<T, E = unknown>(
    promise: Promise<T>
): Promise<GoResult<T, E>> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        return [null, error as unknown as E];
    }
}

/**
 * Pattern Go-style cho hàm đồng bộ (Synchronous)
 */
export function safeSync<T, E = unknown>(
    fn: () => T
): GoResult<T, E> {
    try {
        const data = fn();
        return [data, null];
    } catch (error) {
        return [null, error as unknown as E];
    }
}

/**
 * Kiểu kết quả Thành công (Success)
 */
export interface Ok<T> {
    readonly ok: true;
    readonly data: T;
    readonly errors: null;
}

/**
 * Kiểu kết quả Thất bại (Error) chứa danh sách mô tả lỗi
 */
export interface Err {
    readonly ok: false;
    readonly data: null;
    readonly errors: string[];
}

/**
 * Kiểu Union đại diện cho một Thao tác có thể ra kết quả Thành công hoặc Thất bại
 */
export type Result<T> = Ok<T> | Err;

// ===========================================
// Hàm tạo Result (Constructors)
// ===========================================

/**
 * Trả về một đối tượng bọc kết quả báo Thành Công
 */
export function ok<T>(data: T): Ok<T> {
    return {
        ok: true,
        data,
        errors: null,
    };
}

/**
 * Trả về một đối tượng bọc kết quả báo Lỗi / Thất bại
 */
export function err(errors: string | string[]): Err {
    return {
        ok: false,
        data: null,
        errors: Array.isArray(errors) ? errors : [errors],
    };
}

// ===========================================
// Tiện ích thao tác với Result (Utilities)
// ===========================================

/**
 * Đánh giá Type Guard xem kết quả có Thành công không
 */
export function isOk<T>(result: Result<T>): result is Ok<T> {
    return result.ok === true;
}

/**
 * Đánh giá Type Guard xem kết quả có phải là Lỗi không
 */
export function isErr<T>(result: Result<T>): result is Err {
    return result.ok === false;
}

/**
 * Ánh xạ (Map) dữ liệu qua một hàm Biến đổi nếu trạng thái đang là Thành công
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
 * Chaining (nối chuỗi) nhiều bước thực thi trả về Result móc nối nhau
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
 * Bóc tách lấy Data trong Result, nếu bị Lỗi sẽ thay thế bằng giá trị fallback.
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
    if (isOk(result)) {
        return result.data;
    }
    return defaultValue;
}

/**
 * Chuyển đổi hàm bất đồng bộ Promise thông thường thành pattern Result
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
 * Tổng hợp nhiều kết quả (Result) lại với nhau.
 * Nếu bất cứ Result đơn lẻ nào thất bại -> Lập tức trả về Error tổng hợp.
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
// Trợ thủ bóc dỡ API Response (API Response Helpers)
// ===========================================

/**
 * Cấu trúc Response đến từ Backend
 */
export interface BackendResponse<T> {
    status: number;
    data: T;
    message: string;
}

/**
 * Chuyển mô hình BackendResponse sang chuẩn Result hướng Frontend
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
 * Bóc lỗi chung của việc Call API thành chuẩn Result
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
