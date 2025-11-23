import { z } from "zod";
import { PriceSchema } from "../vo/price.vo";

export const CreateProductDtoSchema = z.object({
	name: z.string(),
	price: PriceSchema,
	description: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;
