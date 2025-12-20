import { z } from "zod";

import { ProductReportPublicSchema } from "../entities/product-report-public.entity";

import { createSuccessResponseSchema } from "@/shared/response/response.dto";

export const ProductReportResponseSchema =
  createSuccessResponseSchema(ProductReportPublicSchema);

export type ProductReportResponse = z.infer<
  typeof ProductReportResponseSchema
>;

export const PaginatedProductReportsResponseSchema =
  createSuccessResponseSchema(
    z.object({
      data: z.array(ProductReportPublicSchema),
      pagination: z.object({
        currentPage: z.number(),
        totalItems: z.number(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
        limit: z.number(),
      }),
    })
  );

export type PaginatedProductReportsResponse = z.infer<
  typeof PaginatedProductReportsResponseSchema
>;
