import { z } from "zod";

import { PriceSchema } from "../vo/price.vo";

/**
 * Data Transfer Object Schema for updating an existing Product.
 * All fields are optional to support partial updates (PATCH).
 */
export const UpdateProductDtoSchema = z.object({
    /** New name of the product if modified */
    name: z.string().optional(),
    /** New price details if modified */
    price: PriceSchema.optional(),
    /** Updated description if modified */
    description: z.string().optional(),
});

/** TypeScript type inferred for product update payload */
export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;
