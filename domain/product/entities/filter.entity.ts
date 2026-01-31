import { z } from "zod";

import { ProductVariantSchema } from "./product.entity";

export const FilterResponseEntitySchema = z.object({
    productId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    displayPrice: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
    totalStock: z.number().optional(),
    status: z.string(),
    variants: z.array(ProductVariantSchema).optional(),
    specsText: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    averageRating: z.number().optional(),
    minPrice: z.number().nullable().optional(),
    maxPrice: z.number().nullable().optional(),
    minRating: z.number().nullable().optional(),
    maxRating: z.number().nullable().optional(),
    sortBy: z.string().nullable().optional(),
    sortOrder: z.string().nullable().optional(),
});

export type FilterResponseEntity = z.infer<typeof FilterResponseEntitySchema>;
