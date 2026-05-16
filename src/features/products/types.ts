import { z } from 'zod';

/**
 * Product Variant Entity
 */
export const ProductVariantSchema = z.object({
    variantId: z.string().optional(),
    color: z.string().optional(),
    storage: z.string().optional(),
    stock: z.number(),
    price: z.number(),
    priceAfterDiscount: z.number().optional(),
    images: z.array(z.string()),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

/**
 * Product Entity
 */
export const ProductSchema = z.object({
    productId: z.union([z.string(), z.number()]).transform(String),
    name: z.string(),
    description: z.string().optional(),
    totalStock: z.number().optional(),
    averageRating: z.number().optional(),
    displayPrice: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
    status: z.string(),
    variants: z.array(ProductVariantSchema).optional(),
    specsText: z.string().optional(),
    brandId: z.union([z.string(), z.number()]).transform(Number).optional(),
    brand: z.string().optional(),
    brandName: z.string().optional(),
    categoryId: z.union([z.string(), z.number()]).transform(Number).optional(),
    category: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Paginated Response for Products
 */
export interface ProductListResponse {
    items: Product[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

/**
 * Brand & Category (Direct Array from API)
 */
export interface Brand {
    brandId: number | string;
    name: string;
    imageUrl?: string;
}

export interface Category {
    categoryId: number | string;
    name: string;
    imageUrl?: string;
}

/**
 * Search Params for Products
 */
export interface ProductSearchParams {
    page?: number | undefined;
    size?: number | undefined;
    sortBy?: string | undefined;
    sortDirection?: 'ASC' | 'DESC' | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    keyword?: string | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
    categoryId?: number | string | undefined;
    brandId?: number | string | undefined;
}

export type ProductStatus = "DRAFT" | "PENDING_REVIEW" | "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface CreateBrandRequest {
    name: string;
}

export interface CreateCategoryRequest {
    name: string;
}

export interface CreateProductVariantRequest {
    variantCode: string;
    price: number;
    stock: number;
    storage: string;
    color: string;
    images: string[];
}

export interface CreateProductRequest {
    name: string;
    description: string;
    displayPrice: number;
    brandId: number;
    categoryId: number;
    status: ProductStatus;
    variants: CreateProductVariantRequest[];
}

export interface UpdateProductRequest {
    name: string;
    description: string;
    displayPrice: number;
    brandId: number;
    categoryId: number;
    status: ProductStatus;
}

export interface UpdateProductVariantRequest {
    price: number;
    stock: number;
    storage: string;
    color: string;
    images: string[];
}

export interface ApplyProductsToDiscountRequest {
    brandIds?: number[];
    categoryIds?: number[];
    productVariantIds?: { productId: string; variantId: string }[];
}
