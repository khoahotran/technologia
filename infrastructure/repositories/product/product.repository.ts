/**
 * Product Repository
 *
 * Implements IProductRepository interface with unified HTTP client.
 * Handles:
 * - Product CRUD operations
 * - Pagination and sorting
 * - Advanced search/filtering
 * - Automatic response validation
 * - Error mapping to domain errors
 */

import { FilterResponseEntitySchema } from "@/domain/product/entities/filter.entity";
import { ProductEntity, ProductEntitySchema } from "@/domain/product/entities/product.entity";
import type {
  IProductRepository,
  ProductPagingResponse,
  ProductSearchParams,
  FilterProductResponse,
} from "@/domain/product/repositories/product.repository.interface";
import { fetchWithToken, adaptResponse, adaptPaginatedResponse, adaptListResponse } from "@/infrastructure/http";
import { createScopedLogger } from "@/lib/logger";



const logger = createScopedLogger('ProductRepository');

// ===========================================
// Constants
// ===========================================

const BASE_PATH = "/products";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "create_at";
const DEFAULT_SORT_DIRECTION = "DESC" as const;

// ===========================================
// Helper Functions
// ===========================================


// ===========================================
// Product Repository Implementation
// ===========================================

/**
 * Triển khai Product Repository
 *
 * Cung cấp các thao tác truy xuất dữ liệu sản phẩm, hỗ trợ tìm kiếm nâng cao,
 * lọc theo nhiều tiêu chí và phân trang.
 */
export const ProductRepository: IProductRepository = {
  /**
   * Lấy toàn bộ danh sách sản phẩm
   */
  async getAll(): Promise<ProductEntity[]> {
    logger.debug('Fetching all products');

    const response = await fetchWithToken(BASE_PATH, {
      method: 'GET',
    });

    return adaptListResponse(response, ProductEntitySchema, 'products');
  },

  /**
   * Lấy chi tiết thông tin của một sản phẩm qua ID
   *
   * @param id Mã định danh sản phẩm
   */
  async getById(id: number | string): Promise<ProductEntity> {
    logger.debug(`Fetching product by ID: ${id}`);

    const response = await fetchWithToken(`${BASE_PATH}/${id}`, {
      method: 'GET',
    });

    return adaptResponse(response, ProductEntitySchema, `product-${id}`);
  },

  /**
   * Lấy danh sách sản phẩm có phân trang và sắp xếp đơn giản
   *
   * @param page Số thứ tự trang (bắt đầu từ 0)
   * @param size Số lượng item trên một trang
   */
  async getPaged(
    page = 0,
    size = DEFAULT_PAGE_SIZE,
    sortBy = DEFAULT_SORT_BY,
    sortDirection: "ASC" | "DESC" = DEFAULT_SORT_DIRECTION
  ): Promise<ProductPagingResponse> {
    logger.debug(`Fetching paginated products`, { page, size, sortBy, sortDirection });

    const response = await fetchWithToken(`${BASE_PATH}/paged`, {
      method: 'GET',
      query: { page: String(page), size: String(size), sortBy, sortDirection },
    });

    return adaptPaginatedResponse(response, ProductEntitySchema, "products-paged");
  },

  /**
   * Tìm kiếm và lọc sản phẩm nâng cao
   * 
   * Hỗ trợ lọc theo:
   * - Từ khóa (tên/mô tả)
   * - Khoảng giá (min/max price)
   * - Khoảng đánh giá (min/max rating)
   * - Theo danh mục và thương hiệu
   * 
   * @param params Các tham số tìm kiếm và lọc
   */
  async searchAndFilter(params: ProductSearchParams): Promise<FilterProductResponse> {
    logger.debug('Searching and filtering products', params as Record<string, unknown>);

    const response = await fetchWithToken(`${BASE_PATH}/search-filter`, {
      method: 'GET',
      query: Object.fromEntries(
        Object.entries(params as Record<string, unknown>)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ),
    });

    return adaptPaginatedResponse(response, FilterResponseEntitySchema, "products-filter");
  },
};
