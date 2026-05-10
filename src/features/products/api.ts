import type {
    ApplyProductsToDiscountRequest,
    Brand,
    Category,
    CreateBrandRequest,
    CreateCategoryRequest,
    CreateProductRequest,
    CreateProductVariantRequest,
    Product,
    ProductListResponse,
    ProductSearchParams,
    UpdateProductRequest,
    UpdateProductVariantRequest,
} from "./types";

import { del, get, patch, post, put } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            clean[key] = value;
        }
    }
    return clean;
}

export async function getProducts(params: ProductSearchParams = {}): Promise<ProductListResponse> {
    const response = await get<PaginatedResponse<Product>>("/api/products/search-filter", {
        params: sanitizeParams(params as Record<string, unknown>),
    });

    return {
        items: response.data || [],
        pageNumber: response.page_number ?? 0,
        pageSize: response.page_size ?? 10,
        totalItems: response.count_items ?? 0,
        totalPages: response.count_pages ?? 0,
    };
}

export async function getProductById(id: string | number): Promise<Product> {
    const response = await get<ApiResponse<Product>>(`/api/products/${id}`);
    return response.data;
}

export async function getBrands(): Promise<Brand[]> {
    const response = await get<ApiResponse<Brand[]>>("/api/brands");
    return response.data;
}

export async function getCategories(): Promise<Category[]> {
    const response = await get<ApiResponse<Category[]>>("/api/categories");
    return response.data;
}

export async function createBrandAdmin(payload: CreateBrandRequest): Promise<Brand> {
    const response = await post<ApiResponse<Brand>>("/api/brands/admin", payload);
    if (response.status !== 200) {
        throw new Error(response.message || "Brand already exists");
    }
    return response.data;
}

export async function updateBrandAdmin(
    brandId: number | string,
    payload: CreateBrandRequest
): Promise<Brand> {
    const response = await patch<ApiResponse<Brand>>(`/api/brands/admin/${brandId}`, payload);
    if (response.status !== 200) {
        throw new Error(response.message || "Brand already exists");
    }
    return response.data;
}

export async function deleteBrandAdmin(brandId: number | string): Promise<void> {
    await del<ApiResponse<null>>(`/api/brands/admin/${brandId}`);
}

export async function createCategoryAdmin(payload: CreateCategoryRequest): Promise<Category> {
    const response = await post<ApiResponse<Category>>("/api/categories/admin", payload);
    if (response.status !== 200) {
        throw new Error(response.message || "Category already exists");
    }
    return response.data;
}

export async function updateCategoryAdmin(
    categoryId: number | string,
    payload: CreateCategoryRequest
): Promise<Category> {
    const response = await patch<ApiResponse<Category>>(`/api/categories/admin/${categoryId}`, payload);
    if (response.status !== 200) {
        throw new Error(response.message || "Category already exists");
    }
    return response.data;
}

export async function deleteCategoryAdmin(categoryId: number | string): Promise<void> {
    await del<ApiResponse<null>>(`/api/categories/admin/${categoryId}`);
}

export async function createProductAdmin(payload: CreateProductRequest): Promise<Product> {
    const response = await post<ApiResponse<Product>>("/api/products/admin", payload);
    return response.data;
}

export async function addProductVariantAdmin(
    productId: string,
    payload: CreateProductVariantRequest
): Promise<Product> {
    const response = await post<ApiResponse<Product>>(`/api/products/admin/${productId}/variant`, payload);
    return response.data;
}

export async function addVariantImageAdmin(
    productId: string,
    variantId: string,
    image: File
): Promise<void> {
    const formData = new FormData();
    formData.append("image", image);
    await post<ApiResponse<unknown>>(`/api/products/admin/${productId}/variant/${variantId}/image`, formData);
}

export async function updateProductAdmin(
    productId: string,
    payload: UpdateProductRequest
): Promise<Product> {
    const response = await put<ApiResponse<Product>>(`/api/products/admin/${productId}`, payload);
    return response.data;
}

export async function updateProductVariantAdmin(
    productId: string,
    variantId: string,
    payload: UpdateProductVariantRequest
): Promise<void> {
    await put<ApiResponse<unknown>>(`/api/products/admin/${productId}/variant/${variantId}`, payload);
}

export async function deleteProductAdmin(productId: string): Promise<void> {
    await del<ApiResponse<null>>(`/api/products/admin/${productId}`);
}

export async function deleteProductVariantAdmin(
    productId: string,
    variantId: string
): Promise<void> {
    await del<ApiResponse<null>>(`/api/products/admin/${productId}/variant/${variantId}`);
}

export async function applyProductsToDiscountAdmin(
    discountId: string,
    payload: ApplyProductsToDiscountRequest
): Promise<void> {
    await put<ApiResponse<unknown>>(`/api/discounts/admin/${discountId}/apply-products`, payload);
}
