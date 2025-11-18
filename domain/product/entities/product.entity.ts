import { BaseEntitySchema } from "@/shared/entities/base.entity";
import { z } from "zod";
import { PriceSchema } from "../vo/price.vo";

export const ProductEntitySchema = BaseEntitySchema.extend({
    productId: z.string(),
    name: z.string(),
    price: PriceSchema,
    description: z.string().optional(),
});

export type ProductEntity = z.infer<typeof ProductEntitySchema>;
