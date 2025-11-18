import { createSuccessResponseSchema } from "@/shared/response/response.dto";
import { z } from "zod";
import { ProductEntitySchema } from "../entities/product.entity";

// --- Single product response ---
export const ProductResponseSchema = createSuccessResponseSchema(ProductEntitySchema);
export type ProductResponse = z.infer<typeof ProductResponseSchema>;

// --- Paginated products response ---
export const PaginatedProductsResponseSchema = createSuccessResponseSchema(
  z.object({
    data: z.array(ProductEntitySchema),
    pagination: z.object({
      currentPage: z.number(),
      totalItems: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
      limit: z.number(),
    }),
  })
);

export type PaginatedProductsResponse = z.infer<typeof PaginatedProductsResponseSchema>;
