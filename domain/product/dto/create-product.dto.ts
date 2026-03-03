import { z } from "zod";

import { PriceSchema } from "../vo/price.vo";

/**
 * Data Transfer Object Schema for creating a new Product.
 */
export const CreateProductDtoSchema = z.object({
	/** Name of the new product */
	name: z.string(),
	/** Price value object (amount + currency) */
	price: PriceSchema,
	/** Optional detailed description of the product */
	description: z.string().optional(),
});

/** TypeScript type inferred for product creation payload */
export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;
