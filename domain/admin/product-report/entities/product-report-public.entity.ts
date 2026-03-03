import type { z } from "zod";

import { ProductReportEntitySchema } from "./product-report.entity";

/**
 * Bản phác thảo Báo cáo Sản phẩm Công khai (Product Report Public Schema)
 * 
 * Hiện tại ánh xạ trực tiếp từ ProductReportEntitySchema, dùng để hiển thị dữ liệu báo cáo sản phẩm.
 */
export const ProductReportPublicSchema =
  ProductReportEntitySchema;

/** Kiểu dữ liệu cho các mục báo cáo sản phẩm chuyển tải tới UI */
export type ProductReportPublic = z.infer<
  typeof ProductReportPublicSchema
>;
