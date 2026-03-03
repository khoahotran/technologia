/**
 * Base Repository
 * Abstract base class providing common CRUD operations
 */

import { z, ZodSchema } from "zod";

import { httpClient } from "@/infrastructure/http/client";
import type { PaginatedResponse } from "@/shared/types";

// ===========================================
// Types
// ===========================================

export interface PagingParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
}

export const DEFAULT_PAGING_PARAMS = {
    page: 0,
    size: 10,
    sortBy: "id",
    sortDirection: "DESC" as const,
};

export function normalizePagingParams(params: PagingParams = {}) {
    return {
        page: params.page ?? DEFAULT_PAGING_PARAMS.page,
        size: params.size ?? DEFAULT_PAGING_PARAMS.size,
        sortBy: params.sortBy ?? DEFAULT_PAGING_PARAMS.sortBy,
        sortDirection: params.sortDirection ?? DEFAULT_PAGING_PARAMS.sortDirection,
    };
}

export interface BaseRepositoryConfig<T> {
    /** Base URL path for the resource (e.g., '/products') */
    basePath: string;

    /** Zod schema for entity validation */
    entitySchema: ZodSchema<T>;
}

// ===========================================
// Response Schemas Factory
// ===========================================

/**
 * Create a paginated response schema for the given entity schema
 */
export function createPaginatedResponseSchema<T>(entitySchema: ZodSchema<T>) {
    return z.object({
        status: z.number(),
        page_number: z.number(),
        page_size: z.number(),
        count_items: z.number(),
        count_pages: z.number(),
        data: z.array(entitySchema),
        message: z.string(),
    });
}

/**
 * Create a single entity response schema
 */
export function createEntityResponseSchema<T>(entitySchema: ZodSchema<T>) {
    return z.object({
        status: z.number().optional(),
        data: entitySchema,
        message: z.string().optional(),
    });
}

/**
 * Create an array response schema
 */
export function createArrayResponseSchema<T>(entitySchema: ZodSchema<T>) {
    return z.object({
        status: z.number().optional(),
        data: z.array(entitySchema),
        message: z.string().optional(),
    });
}

// ===========================================
// Base Repository Factory
// ===========================================

/**
 * Khởi tạo một Repository cơ bản với đầy đủ các thao tác CRUD
 *
 * Pattern này giúp giảm thiểu code lặp lại (boilerplate) cho các thực thể chuẩn.
 * Nó tự động thiết lập các Schema xác thực Zod dựa trên thực thể được truyền vào.
 *
 * @param config Cấu hình bao gồm đường dẫn API gốc và Schema của thực thể
 * @returns Đối tượng chứa các hàm thao tác dữ liệu (getAll, getById, create, update, delete...)
 */
export function createBaseRepository<T>(config: BaseRepositoryConfig<T>) {
    const { basePath, entitySchema } = config;

    // Tự động tạo các schema xác thực cho Response (Đã bọc trong metadata của API)
    const pagedSchema = createPaginatedResponseSchema(entitySchema);
    const singleSchema = createEntityResponseSchema(entitySchema);

    /**
     * Tầng triển khai thực tế của các hàm CRUD
     */
    return {
        /**
         * Lấy toàn bộ danh sách thực thể (Không phân trang)
         * Thường dùng cho các danh mục nhỏ (Brands, Categories, v.v.)
         */
        async getAll(): Promise<T[]> {
            const { data } = await httpClient.get(basePath);

            // Xử lý linh hoạt: Chấp nhận cả mảng trực tiếp hoặc mảng được bọc trong object 'data'
            if (Array.isArray(data)) {
                return z.array(entitySchema).parse(data);
            }
            const parsed = createArrayResponseSchema(entitySchema).parse(data);
            return parsed.data;
        },

        /**
         * Lấy thông tin chi tiết của một thực thể qua ID
         */
        async getById(id: string | number): Promise<T> {
            const { data } = await httpClient.get(`${basePath}/${id}`);
            // Xác thực dữ liệu trả về và bóc tách ra khỏi lớp vỏ Response
            const parsed = singleSchema.parse(data);
            return parsed.data;
        },

        /**
         * Lấy danh sách thực thể có hỗ trợ Phân trang và Sắp xếp
         */
        async getPaged(
            params: PagingParams = {}
        ): Promise<PaginatedResponse<T>> {
            // Chuẩn hóa các tham số (page, size, sortBy...)
            const { page, size, sortBy, sortDirection } = normalizePagingParams(params);

            const { data } = await httpClient.get(`${basePath}/paged`, {
                params: { page, size, sortBy, sortDirection },
            });

            // Xác thực cấu trúc phân trang phức tạp từ Backend
            const parsed = pagedSchema.parse(data);
            return parsed;
        },

        /**
         * Tạo mới một thực thể
         */
        async create(payload: Partial<T>): Promise<T> {
            const { data } = await httpClient.post(basePath, payload);
            const parsed = singleSchema.parse(data);
            return parsed.data;
        },

        /**
         * Cập nhật thông tin thực thể hiện có (Partial update)
         */
        async update(id: string | number, payload: Partial<T>): Promise<T> {
            const { data } = await httpClient.put(`${basePath}/${id}`, payload);
            const parsed = singleSchema.parse(data);
            return parsed.data;
        },

        /**
         * Xóa bỏ một thực thể khỏi hệ thống
         */
        async delete(id: string | number): Promise<void> {
            await httpClient.delete(`${basePath}/${id}`);
        },

        /** Trả về đường dẫn gốc của resource (Hữu ích cho các query tùy chỉnh bên ngoài) */
        getBasePath(): string {
            return basePath;
        },

        /** Trả về schema gốc của thực thể (Dùng để xác thực dữ liệu input ở tầng UI) */
        getEntitySchema(): ZodSchema<T> {
            return entitySchema;
        },
    };
}

// ===========================================
// Type Helpers
// ===========================================

export type BaseRepository<T> = ReturnType<typeof createBaseRepository<T>>;
