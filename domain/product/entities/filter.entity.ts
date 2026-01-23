import { z } from "zod";
import { ProductVariantSchema } from "./product.entity";

export const FilterResponseEntitySchema = z.object({
    productId: z.number(),
    name: z.string(),
    description: z.string().optional(),
    displayPrice: z.number().optional(),
    totalStock: z.number().optional(),
    status: z.string(),
    variants: z.array(ProductVariantSchema).optional(),
    specsText: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    averageRating: z.number().optional(),
    minPrice: z.number().optional(), // From filter metadata in response item? Or is this range for the item? User requirements say "minPrice" in response object.
    maxPrice: z.number().optional(),
    minRating: z.number().optional(),
    maxRating: z.number().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
});

export type FilterResponseEntity = z.infer<typeof FilterResponseEntitySchema>;
