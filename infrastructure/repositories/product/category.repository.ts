/**
 * Category Repository
 *
 * Implements ICategoryRepository with unified HTTP client.
 */

import { CategoryEntity, CategoryEntitySchema } from "@/domain/product/entities/category.entity";
import { CategoryPagingResponse, ICategoryRepository } from "@/domain/product/repositories/category.repository.interface";
import { fetchWithToken } from "@/infrastructure/http";
import { CategoryListResponseSchema, CategoryPaginatedResponseSchema } from "@/shared/validators/api-schemas";
import { createScopedLogger } from "@/lib/logger";

const logger = createScopedLogger('CategoryRepository');
const BASE_PATH = "/categories";

export const CategoryRepository: ICategoryRepository = {
    /**
     * Get all categories
     */
    async getAll(): Promise<CategoryEntity[]> {
        logger.debug('Fetching all categories');
        
        const response = await fetchWithToken(BASE_PATH, { method: 'GET' });
        const validated = CategoryListResponseSchema.parse(response);
        return validated.data;
    },

    /**
     * Get category by ID
     */
    async getById(id: number): Promise<CategoryEntity> {
        logger.debug(`Fetching category by ID: ${id}`);
        
        const response = await fetchWithToken(`${BASE_PATH}/${id}`, { method: 'GET' });
        const data = response instanceof Object && 'data' in response 
            ? (response as any).data 
            : response;
        return CategoryEntitySchema.parse(data);
    },

    /**
     * Get paginated categories
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
