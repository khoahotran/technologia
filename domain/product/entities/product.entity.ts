import { z } from "zod";
import { BaseEntitySchema } from "@/shared/entities/base.entity";
import { PriceSchema } from "../value-objects/price.vo";

export const ProductEntitySchema = BaseEntitySchema.extend({
    productId: z.string(),
    name: z.string(),
    price: PriceSchema,
    description: z.string().optional(),
});

export type ProductEntity = z.infer<typeof ProductEntitySchema>;
