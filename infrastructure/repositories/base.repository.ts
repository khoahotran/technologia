/**
 * Repository Cơ sở (Base Repository)
 *
 * Lớp trừu tượng cung cấp các thao tác CRUD dùng chung cho toàn bộ repositories.
 * Giảm thiểu code lặp bằng Factory Pattern + Zod Validation.
 */

import { ZodSchema } from "zod";

import { fetchWithToken, adaptPaginatedResponse, adaptResponse, adaptListResponse } from "@/infrastructure/http";
import type { DomainPaginatedResponse } from "@/shared/types";


// ===========================================
// Types
// ===========================================

/** Tham số phân trang và sắp xếp dùng chung */
export interface PagingParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
}

/** Giá trị phân trang mặc định nếu người dùng không truyền tham số */
export const DEFAULT_PAGING_PARAMS = {
    page: 0,
    size: 10,
    sortBy: "id",
    sortDirection: "DESC" as const,
};

/**
 * Chuẩn hóa tham số phân trang bằng cách điền giá trị mặc định cho các field bị thiếu
 * @param params Tham số phân trang tùy chỉnh từ phía gọi hàm
 */
export function normalizePagingParams(params: PagingParams = {}) {
    return {
        page: params.page ?? DEFAULT_PAGING_PARAMS.page,
        size: params.size ?? DEFAULT_PAGING_PARAMS.size,
        sortBy: params.sortBy ?? DEFAULT_PAGING_PARAMS.sortBy,
        sortDirection: params.sortDirection ?? DEFAULT_PAGING_PARAMS.sortDirection,
    };
}

/** Cấu hình cần thiết để khởi tạo BaseRepository */
export interface BaseRepositoryConfig<T> {
    /** Đường dẫn API gốc cho tài nguyên (VD: '/products') */
    basePath: string;

    /** Zod Schema để xác thực dữ liệu của thực thể */
    entitySchema: ZodSchema<T>;
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

    /**
     * Tầng triển khai thực tế của các hàm CRUD
     */
    return {
        /**
         * Lấy toàn bộ danh sách thực thể (Không phân trang)
         * Thường dùng cho các danh mục nhỏ (Brands, Categories, v.v.)
         */
        async getAll(): Promise<T[]> {
            const response = await fetchWithToken<T[]>(basePath, { method: 'GET' });
            return adaptListResponse(response, entitySchema, `${basePath}-all`);
        },

        /**
         * Lấy thông tin chi tiết của một thực thể qua ID
         * @param id Mã định danh duy nhất của thực thể cần lấy
         */
        async getById(id: string | number): Promise<T> {
            const response = await fetchWithToken<T>(`${basePath}/${id}`, { method: 'GET' });
            return adaptResponse(response, entitySchema, `${basePath}-detail`);
        },

        /**
         * Lấy danh sách thực thể có hỗ trợ Phân trang và Sắp xếp
         * @param params Tham số phân trang (page, size, sortBy, sortDirection)
         */
        async getPaged(
            params: PagingParams = {}
        ): Promise<DomainPaginatedResponse<T>> {
            // Chuẩn hóa các tham số (page, size, sortBy...)
            const { page, size, sortBy, sortDirection } = normalizePagingParams(params);

            const response = await fetchWithToken<T>(`${basePath}/paged`, {
                method: 'GET',
                query: { page: String(page), size: String(size), sortBy, sortDirection },
            });

            // Sử dụng ResponseAdapter để chuẩn hóa dữ liệu từ snake_case sang camelCase
            return adaptPaginatedResponse(response, entitySchema, basePath);
        },

        /**
         * Tạo mới một thực thể
         * @param payload Dữ liệu cần tạo mới
         */
        async create(payload: Partial<T>): Promise<T> {
            const response = await fetchWithToken<T>(basePath, { method: 'POST', body: payload });
            return adaptResponse(response, entitySchema, `${basePath}-create`);
        },

        /**
         * Cập nhật thông tin thực thể hiện có (Partial update)
         * @param id Mã định danh của thực thể cần cập nhật
         * @param payload Dữ liệu cần cập nhật
         */
        async update(id: string | number, payload: Partial<T>): Promise<T> {
            const response = await fetchWithToken<T>(`${basePath}/${id}`, { method: 'PUT', body: payload });
            return adaptResponse(response, entitySchema, `${basePath}-update`);
        },

        /**
         * Xóa bỏ một thực thể khỏi hệ thống
         * @param id Mã định danh của thực thể cần xóa
         */
        async delete(id: string | number): Promise<void> {
            await fetchWithToken(`${basePath}/${id}`, { method: 'DELETE' });
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

/** Kiểu dữ liệu TypeScript suy diễn từ createBaseRepository */
export type BaseRepository<T> = ReturnType<typeof createBaseRepository<T>>;

