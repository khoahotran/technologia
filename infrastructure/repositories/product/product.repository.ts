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

import { fetchWithToken } from "@/infrastructure/http";
import {
  ProductPaginatedResponseSchema,
  FilterPaginatedResponseSchema,
  ProductResponseSchema,
  FilterResponseSchema,
} from "@/shared/validators/api-schemas";
import type {
  IProductRepository,
  ProductPagingResponse,
  ProductSearchParams,
  FilterProductResponse,
} from "@/domain/product/repositories/product.repository.interface";
import { ProductEntity, ProductEntitySchema } from "@/domain/product/entities/product.entity";
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

/**
 * Normalize product entity from API response
 */
function normalizeProductEntity(data: unknown): ProductEntity {
  return ProductEntitySchema.parse(data);
}

/**
 * Normalize filter response from API
 */
function normalizeFilterResponse(data: unknown): FilterProductResponse {
  try {
    const validated = FilterPaginatedResponseSchema.parse(data);
    return {
      status: validated.status,
      page_number: validated.page_number,
      page_size: validated.page_size,
      count_items: validated.count_items,
      count_pages: validated.count_pages,
      data: validated.data.map(item => ({
        productId: item.productId,
        name: item.name,
        description: item.description,
        displayPrice: item.displayPrice,
        totalStock: item.totalStock,
        status: item.status,
        variants: item.variants,
        specsText: item.specsText,
        brand: item.brand,
        category: item.category,
        averageRating: item.averageRating ?? undefined,
        minPrice: item.minPrice ?? undefined,
        maxPrice: item.maxPrice ?? undefined,
        minRating: item.minRating ?? undefined,
        maxRating: item.maxRating ?? undefined,
        sortBy: item.sortBy,
        sortOrder: item.sortOrder,
      })),
      message: validated.message,
    };
  } catch (error) {
    logger.error('Failed to normalize filter response', error);
    throw error;
  }
}

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

    // Xử lý linh hoạt các định dạng Response khác nhau từ API
    const products = Array.isArray(response)
      ? response
      : response instanceof Object && 'data' in response
        ? (response as any).data
        : [response];

    // Chuyển đổi dữ liệu thô sang Entity chuẩn của Domain
    return products.map(normalizeProductEntity);
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

    // Bóc tách khối 'data' nếu kết quả bị bọc trong Response Object
    const data = response instanceof Object && 'data' in response
      ? (response as any).data
      : response;

    return normalizeProductEntity(data);
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
      query: {
        page: String(page),
        size: String(size),
        sortBy,
        sortDirection,
      },
    });

    // Xác thực cấu trúc phân trang từ server
    const validated = ProductPaginatedResponseSchema.parse(response);

    return {
      status: validated.status,
      page_number: validated.page_number,
      page_size: validated.page_size,
      count_items: validated.count_items,
      count_pages: validated.count_pages,
      // Chuyển đổi và xác thực từng item sang ProductEntity (bao gồm việc đổi string thành Date)
      data: validated.data.map(normalizeProductEntity),
      message: validated.message,
    };
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
    const {
      page = 0,
      size = DEFAULT_PAGE_SIZE,
      sortBy = DEFAULT_SORT_BY,
      sortDirection = DEFAULT_SORT_DIRECTION,
      keyword,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      categoryId,
      brandId,
    } = params;

    logger.debug('Searching and filtering products', { page, size, keyword, minPrice, maxPrice });

    // Gửi request kèm theo toàn bộ Query Params đã được chuỗi hóa
    const response = await fetchWithToken(`${BASE_PATH}/search-filter`, {
      method: 'GET',
      query: {
        page: String(page),
        size: String(size),
        sortBy,
        sortDirection,
        ...(keyword && { keyword }),
        ...(minPrice !== undefined && { minPrice: String(minPrice) }),
        ...(maxPrice !== undefined && { maxPrice: String(maxPrice) }),
        ...(minRating !== undefined && { minRating: String(minRating) }),
        ...(maxRating !== undefined && { maxRating: String(maxRating) }),
        ...(categoryId !== undefined && { categoryId: String(categoryId) }),
        ...(brandId !== undefined && { brandId: String(brandId) }),
      },
    });

    // Sử dụng helper để chuẩn hóa kết quả tìm kiếm phức tạp
    return normalizeFilterResponse(response);
  },
};
