import { z } from "zod";

import { PriceSchema } from "../vo/price.vo";

import { BaseEntitySchema } from "@/shared/entities/base.entity";

export const ProductEntitySchema = BaseEntitySchema.extend({
    productId: z.union([z.string(), z.number()]).transform((val) => String(val)),
    name: z.string(),
    price: z.number(),
    description: z.string().optional(),
    stockQuantity: z.number(),
    status: z.string(),
    imageUrls: z.array(z.string()),
    brandName: z.string().optional(),
});

export type ProductEntity = z.infer<typeof ProductEntitySchema>;
