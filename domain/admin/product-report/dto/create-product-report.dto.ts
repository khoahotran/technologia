import z from "zod";

/**
 * Bản phác thảo DTO dùng để tạo mới một bản ghi báo cáo sản phẩm.
 */
export const CreateProductReportDtoSchema = z.object({
  /** Mã định danh sản phẩm mục tiêu */
  productId: z.string(),
  /** Mã định danh của báo cáo cha chứa sản phẩm này */
  reportId: z.string(),
  /** Doanh thu tính toán được trong kỳ báo cáo */
  revenue: z.number(),
  /** Số lượng bán hàng tính toán được trong kỳ báo cáo */
  quantitySold: z.number(),
});

/** Kiểu dữ liệu TypeScript cho payload tạo báo cáo sản phẩm */
export type CreateProductReportDto = z.infer<
  typeof CreateProductReportDtoSchema
>;
