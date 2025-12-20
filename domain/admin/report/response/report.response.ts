import { z } from "zod";

import { ReportPublicSchema } from "../entities/report-public.entity";

import { createSuccessResponseSchema } from "@/shared/response/response.dto";

export const ReportResponseSchema =
  createSuccessResponseSchema(ReportPublicSchema);

export type ReportResponse = z.infer<typeof ReportResponseSchema>;

export const PaginatedReportsResponseSchema =
  createSuccessResponseSchema(
    z.object({
      data: z.array(ReportPublicSchema),
      pagination: z.object({
        currentPage: z.number(),
        totalItems: z.number(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
        limit: z.number(),
      }),
    })
  );

export type PaginatedReportsResponse = z.infer<
  typeof PaginatedReportsResponseSchema
>;
