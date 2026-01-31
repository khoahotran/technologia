import { z } from "zod";


import { BaseEntitySchema } from "@/shared/entities/base.entity";

export const ProductVariantSchema = z.object({
    variantId: z.string().optional(),
    color: z.string().optional(),
    storage: z.string().optional(),
    stock: z.number(),
    price: z.number(), // Use number for decimal values in JSON
    images: z.array(z.string()),
});

export const ProductEntitySchema = BaseEntitySchema.extend({
    productId: z.string(), // API returns UUID string
    name: z.string(),
    description: z.string().optional(),
    totalStock: z.number().optional(),
    averageRating: z.number().optional(),
    displayPrice: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
    status: z.string(),
    variants: z.array(ProductVariantSchema).optional(),
    specsText: z.string().optional(),
    brand: z.string().optional(), // Brand name from API
    brandName: z.string().optional(), // Keep for backward compatibility
    category: z.string().optional(), // Category name from API
});

export type ProductEntity = z.infer<typeof ProductEntitySchema>;
