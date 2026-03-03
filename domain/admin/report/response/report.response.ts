import { z } from "zod";

import { ReportPublicSchema } from "../entities/report-public.entity";

import { createSuccessResponseSchema } from "@/shared/response/response.dto";

/**
 * Bản phác thảo phản hồi cho một Báo cáo duy nhất.
 */
export const ReportResponseSchema =
  createSuccessResponseSchema(ReportPublicSchema);

export type ReportResponse = z.infer<typeof ReportResponseSchema>;

/**
 * Bản phác thảo phản hồi cho Danh sách Báo cáo có phân trang.
 */
export const PaginatedReportsResponseSchema =
  createSuccessResponseSchema(
    z.object({
      /** Mảng các thực thể báo cáo công khai */
      data: z.array(ReportPublicSchema),
      /** Thông tin phân trang từ hệ thống */
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
