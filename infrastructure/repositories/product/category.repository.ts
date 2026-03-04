/**
 * Triển khai Category Repository (Category Repository Implementation)
 *
 * Triển khai `ICategoryRepository` sử dụng HTTP client thống nhất (fetchWithToken).
 * Cung cấp các thao tác truy xuất dữ liệu Danh mục sản phẩm (Category):
 * - Lấy toàn bộ danh sách danh mục
 * - Lấy danh mục theo ID
 * - Lấy danh sách danh mục có phân trang
 */

import { CategoryEntity, CategoryEntitySchema } from "@/domain/product/entities/category.entity";
import { CategoryPagingResponse, ICategoryRepository } from "@/domain/product/repositories/category.repository.interface";
import { fetchWithToken } from "@/infrastructure/http";
import { CategoryListResponseSchema, CategoryPaginatedResponseSchema } from "@/shared/validators/api-schemas";
import { createScopedLogger } from "@/lib/logger";

const logger = createScopedLogger('CategoryRepository');
/** Đường dẫn gốc API cho tài nguyên Category */
const BASE_PATH = "/categories";

export const CategoryRepository: ICategoryRepository = {
    /**
     * Lấy toàn bộ danh sách Danh mục (Không phân trang)
     * Dùng cho việc hiển thị dropdown chọn danh mục trong form lọc.
     */
    async getAll(): Promise<CategoryEntity[]> {
        logger.debug('Fetching all categories');

        const response = await fetchWithToken(BASE_PATH, { method: 'GET' });
        const validated = CategoryListResponseSchema.parse(response);
        return validated.data;
    },

    /**
     * Lấy thông tin chi tiết của một Danh mục theo ID
     * @param id Mã định danh số nguyên của danh mục
     */
    async getById(id: number): Promise<CategoryEntity> {
        logger.debug(`Fetching category by ID: ${id}`);

        const response = await fetchWithToken(`${BASE_PATH}/${id}`, { method: 'GET' });
        // Xử lý linh hoạt trường hợp response bọc trong object hoặc trả về trực tiếp
        const data = response instanceof Object && 'data' in response
            ? (response as any).data
            : response;
        return CategoryEntitySchema.parse(data);
    },

    /**
     * Lấy danh sách Danh mục có phân trang và sắp xếp
     * @param page Số trang (bắt đầu từ 0)
     * @param size Số item mỗi trang
     * @param sortBy Trường sắp xếp (mặc định: "id")
     * @param sortDirection Chiều sắp xếp ("ASC" | "DESC", mặc định: "DESC")
     */
    async getPaged(
        page = 0,
        size = 10,
        sortBy = "id",
        sortDirection: string = "DESC"
    ): Promise<CategoryPagingResponse> {
        logger.debug('Fetching paginated categories', { page, size, sortBy, sortDirection });

        const response = await fetchWithToken(`${BASE_PATH}/paged`, {
            method: 'GET',
            query: {
                page: String(page),
                size: String(size),
                sortBy,
                sortDirection,
            },
        });

        const validated = CategoryPaginatedResponseSchema.parse(response);
        return {
            status: validated.status,
            page_number: validated.page_number,
            page_size: validated.page_size,
            count_items: validated.count_items,
            count_pages: validated.count_pages,
            data: validated.data,
            message: validated.message,
        };
    },
};
