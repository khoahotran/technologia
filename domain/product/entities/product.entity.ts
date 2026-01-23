import { z } from "zod";

import { PriceSchema } from "../vo/price.vo";

import { BaseEntitySchema } from "@/shared/entities/base.entity";

export const ProductVariantSchema = z.object({
    color: z.string().optional(),
    storage: z.string().optional(),
    stock: z.number(),
    price: z.number(), // Use number for decimal values in JSON
    images: z.array(z.string()),
});

export const ProductEntitySchema = BaseEntitySchema.extend({
    productId: z.union([z.string(), z.number()]).transform((val) => Number(val)), // API seems to return number? User example has `productId: ,` which usually implies number.
    name: z.string(),
    description: z.string().optional(),
    totalStock: z.number().optional(), // totalStock in response
    averageRating: z.number().optional(),
    displayPrice: z.number().optional(),
    status: z.string(),
    variants: z.array(ProductVariantSchema).optional(),
    specsText: z.string().optional(),
    brandName: z.string().optional(), // Kept for backward compat if needed, though response implies separate brand object in filters
});

export type ProductEntity = z.infer<typeof ProductEntitySchema>;
