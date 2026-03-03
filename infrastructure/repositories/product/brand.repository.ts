/**
 * Brand Repository
 *
 * Implements IBrandRepository with unified HTTP client.
 */

import { BrandEntity, BrandEntitySchema } from "@/domain/product/entities/brand.entity";
import { BrandPagingResponse, IBrandRepository } from "@/domain/product/repositories/brand.repository.interface";
import { fetchWithToken } from "@/infrastructure/http";
import { BrandListResponseSchema, BrandPaginatedResponseSchema } from "@/shared/validators/api-schemas";
import { createScopedLogger } from "@/lib/logger";

const logger = createScopedLogger('BrandRepository');
const BASE_PATH = "/brands";

export const BrandRepository: IBrandRepository = {
    /**
     * Get all brands
     */
    async getAll(): Promise<BrandEntity[]> {
        logger.debug('Fetching all brands');
        
        const response = await fetchWithToken(BASE_PATH, { method: 'GET' });
        const validated = BrandListResponseSchema.parse(response);
        return validated.data;
    },

    /**
     * Get brand by ID
     */
    async getById(id: number): Promise<BrandEntity> {
        logger.debug(`Fetching brand by ID: ${id}`);
        
        const response = await fetchWithToken(`${BASE_PATH}/${id}`, { method: 'GET' });
        const data = response instanceof Object && 'data' in response 
            ? (response as any).data 
            : response;
        return BrandEntitySchema.parse(data);
    },

    /**
     * Get paginated brands
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
