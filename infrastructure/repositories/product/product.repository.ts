import { FilterResponseEntitySchema } from "@/domain/product/entities/filter.entity";
import { ProductEntity, ProductEntitySchema } from "@/domain/product/entities/product.entity";
import type {
  IProductRepository,
  ProductPagingResponse,
  ProductSearchParams,
  FilterProductResponse,
} from "@/domain/product/repositories/product.repository.interface";
import { httpClient } from "@/infrastructure/http/client";
import {
  createBaseRepository,
  createPaginatedResponseSchema,
  normalizePagingParams,
} from "@/infrastructure/repositories/base.repository";
import { REQUEST_CONFIG } from "@/shared";

// ===========================================
// Constants
// ===========================================

const BASE_PATH = "/products";

// ===========================================
// Custom Response Schemas
// ===========================================

const FilterProductResponseSchema = createPaginatedResponseSchema(FilterResponseEntitySchema);

// ===========================================
// Base Repository
// ===========================================

const baseRepository = createBaseRepository<ProductEntity>({
  basePath: BASE_PATH,
  entitySchema: ProductEntitySchema,
});

// ===========================================
// Product Repository Implementation
// ===========================================

export const ProductRepository: IProductRepository = {
  /**
   * Get all products
   */
  getAll: baseRepository.getAll,

  /**
   * Get product by ID
   */
  getById: baseRepository.getById,

  /**
   * Get paginated products
   */
  getPaged: async (
    page = 0,
    size = 10,
    sortBy = "create_at",
    sortDirection: "ASC" | "DESC" = "DESC"
  ): Promise<ProductPagingResponse> => {
    const paging = normalizePagingParams({ page, size, sortBy, sortDirection });
    return baseRepository.getPaged(paging) as Promise<ProductPagingResponse>;
  },

  /**
   * Search and filter products
   * Custom method not in base repository
   */
  searchAndFilter: async (params: ProductSearchParams): Promise<FilterProductResponse> => {
    const paging = normalizePagingParams({
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy ?? "createdAt",
      sortDirection: params.sortDirection as "ASC" | "DESC" || REQUEST_CONFIG.DEFAULT_SORT_DIRECTION,
    });

    const { data } = await httpClient.get(`${BASE_PATH}/search-filter`, {
      params: {
        ...paging,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        keyword: params.keyword,
        minRating: params.minRating,
        maxRating: params.maxRating,
        categoryId: params.categoryId,
        brandId: params.brandId,
      },
    });
    return FilterProductResponseSchema.parse(data);
  },
};

// Re-export for convenience
export { baseRepository as ProductBaseRepository };
