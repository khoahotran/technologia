import { z } from 'zod';

export const CreateDiscountSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    scope: z.enum(['PRODUCT_SPECIFIC', 'USER_SPECIFIC']),
    discountValue: z.number().min(0, 'Value must be >= 0'),
    availableAt: z.string().optional(),
    expiredAt: z.string().optional(),
    remainingUsage: z.number().int().min(0).optional(),
    maxUsagePerUser: z.number().int().min(0).optional(),
    minOrderValue: z.number().min(0).optional(),
    description: z.string().optional(),
});

export type CreateDiscountRequest = z.infer<typeof CreateDiscountSchema>;

export const DiscountPagedParamsSchema = z.object({
    page: z.number().optional(),
    size: z.number().optional(),
    sortBy: z.string().optional(),
    sortDirection: z.string().optional(),
});

export type DiscountPagedParams = z.infer<typeof DiscountPagedParamsSchema>;

export interface DiscountListResponse {
    items: DiscountResponse[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface DiscountResponse {
    discountId: string;
    createAt?: string;
    availableAt?: string;
    expireAt?: string;
    code: string;
    type: string;
    scope: string;
    discountValue: number;
    description?: string | null;
    name: string;
    remainingUsage?: number;
    maxUsagePerUser?: number;
    minOrderValue?: number;
    isActive?: boolean;
}

export interface UpdateProductDiscountRequest {
    brandIds?: number[];
    categoryIds?: number[];
    productVariantIds?: { productId: string; variantId: string }[];
}
