import z from "zod";

/**
 * Đối tượng giá trị Loại Báo cáo (Report Type Value Object)
 * 
 * Định nghĩa các phân loại báo cáo chính trong hệ thống (VD: Thống kê sản phẩm, doanh thu...).
 */
export const ReportType = z.enum([
  "PRODUCT_STAT",
  "USER_STAT",
  "REVENUE_SUMMARY",
  "CUSTOM_REPORT",
]);

/** Kiểu dữ liệu TypeScript cho phân loại báo cáo */
export type ReportType = z.infer<typeof ReportType>;
