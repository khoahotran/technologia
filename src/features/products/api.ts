import type {
    Product,
    ProductListResponse,
    Brand,
    Category,
    ProductSearchParams
} from './types';

import { get } from '@/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

/**
 * Fetch products with pagination and filters
 */
export async function getProducts(params: ProductSearchParams = {}): Promise<ProductListResponse> {
    const response = await get<PaginatedResponse<Product>>('/api/products/search-filter', { params });

    // Transform backend PaginationBaseResponse to our ProductListResponse
    return {
        items: response.data || [],
        pageNumber: response.page_number ?? 0,
        pageSize: response.page_size ?? 10,
        totalItems: response.count_items ?? 0,
        totalPages: response.count_pages ?? 0,
    };
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string | number): Promise<Product> {
    // Returns BaseResponse<ProductResponse>
    const response = await get<ApiResponse<Product>>(`/api/products/${id}`);
    return response.data;
}

/**
 * Fetch all brands (Direct Array)
 */
export async function getBrands(): Promise<Brand[]> {
    return get<Brand[]>('/api/brands');
}

/**
 * Fetch all categories (Direct Array)
 */
export async function getCategories(): Promise<Category[]> {
    return get<Category[]>('/api/categories');
}

