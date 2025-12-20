import { z } from "zod";

import { PriceSchema } from "../vo/price.vo";

export const UpdateProductDtoSchema = z.object({
    name: z.string().optional(),
    price: PriceSchema.optional(),
    description: z.string().optional(),
});

export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;
