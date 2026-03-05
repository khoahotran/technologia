/**
 * Triển khai Brand Repository (Brand Repository Implementation)
 *
 * Triển khai `IBrandRepository` sử dụng HTTP client thống nhất (fetchWithToken).
 * Cung cấp các thao tác truy xuất dữ liệu Thương hiệu (Brand):
 * - Lấy toàn bộ danh sách thương hiệu
 * - Lấy thương hiệu theo ID
 * - Lấy danh sách thương hiệu có phân trang
 */

import { BrandEntity, BrandEntitySchema } from "@/domain/product/entities/brand.entity";
import { BrandPagingResponse, IBrandRepository } from "@/domain/product/repositories/brand.repository.interface";
import { fetchWithToken } from "@/infrastructure/http";
import { createScopedLogger } from "@/lib/logger";
import { BrandListResponseSchema, BrandPaginatedResponseSchema } from "@/shared/validators/api-schemas";

const logger = createScopedLogger('BrandRepository');
/** Đường dẫn gốc API cho tài nguyên Brand */
const BASE_PATH = "/brands";

export const BrandRepository: IBrandRepository = {
    /**
     * Lấy toàn bộ danh sách Thương hiệu (Không phân trang)
     * Dùng cho việc hiển thị dropdown chọn thương hiệu trong form lọc.
     */
    async getAll(): Promise<BrandEntity[]> {
        logger.debug('Fetching all brands');

        const response = await fetchWithToken(BASE_PATH, { method: 'GET' });
        const validated = BrandListResponseSchema.parse(response);
        return validated.data;
    },

    /**
     * Lấy thông tin chi tiết của một Thương hiệu theo ID
     * @param id Mã định danh số nguyên của thương hiệu
     */
    async getById(id: number): Promise<BrandEntity> {
        logger.debug(`Fetching brand by ID: ${id}`);

        const response = await fetchWithToken(`${BASE_PATH}/${id}`, { method: 'GET' });
        // Xử lý linh hoạt trường hợp response bọc trong object hoặc trả về trực tiếp
        const data = response instanceof Object && 'data' in response
            ? (response as { data: unknown }).data
            : response;
        return BrandEntitySchema.parse(data);
    },

    /**
     * Lấy danh sách Thương hiệu có phân trang và sắp xếp
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
    ): Promise<BrandPagingResponse> {
        logger.debug('Fetching paginated brands', { page, size, sortBy, sortDirection });

        const response = await fetchWithToken(`${BASE_PATH}/paged`, {
            method: 'GET',
            query: {
                page: String(page),
                size: String(size),
                sortBy,
                sortDirection,
            },
        });

        const validated = BrandPaginatedResponseSchema.parse(response);
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
