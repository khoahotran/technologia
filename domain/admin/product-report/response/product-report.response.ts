import { z } from "zod";

import { ProductReportPublicSchema } from "../entities/product-report-public.entity";

import { createSuccessResponseSchema } from "@/shared/response/response.dto";

/**
 * Bản phác thảo phản hồi cho một Báo cáo Sản phẩm duy nhất.
 */
export const ProductReportResponseSchema =
  createSuccessResponseSchema(ProductReportPublicSchema);

/** Kiểu dữ liệu cho phản hồi API báo cáo sản phẩm đơn lẻ */
export type ProductReportResponse = z.infer<
  typeof ProductReportResponseSchema
>;

/**
 * Bản phác thảo phản hồi cho Danh sách Báo cáo Sản phẩm có phân trang.
 */
export const PaginatedProductReportsResponseSchema =
  createSuccessResponseSchema(
    z.object({
      /** Mảng các thực thể báo cáo sản phẩm an toàn cho UI */
      data: z.array(ProductReportPublicSchema),
      /** Ngữ cảnh phân trang tiêu chuẩn */
      pagination: z.object({
        currentPage: z.number(),
        totalItems: z.number(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
        limit: z.number(),
      }),
    })
  );

/** Kiểu dữ liệu cho phản hồi API báo cáo sản phẩm có phân trang */
export type PaginatedProductReportsResponse = z.infer<
  typeof PaginatedProductReportsResponseSchema
>;
