import z from "zod";

/**
 * Thực thể Báo cáo Sản phẩm (Product Report Entity)
 * 
 * Đại diện cho các thông số phân tích của một sản phẩm cụ thể.
 * Ánh xạ các chỉ số hiệu suất cho một sản phẩm trong một kỳ báo cáo.
 */
export const ProductReportEntitySchema = z.object({
  /** Mã định danh duy nhất của sản phẩm liên quan */
  productId: z.string(),
  /** Mã định danh của báo cáo cha chứa sản phẩm này */
  reportId: z.string(),
  /** Tổng doanh thu bằng tiền do sản phẩm này tạo ra */
  revenue: z.number(),
  /** Tổng số lượng đơn vị sản phẩm đã bán được */
  quantitySold: z.number(),
});

/** Kiểu dữ liệu TypeScript cho dữ liệu báo cáo chi tiết sản phẩm */
export type ProductReportEntity = z.infer<
  typeof ProductReportEntitySchema
>;
