import z from "zod";

import { ReportType } from "../vo";

import { BaseEntitySchema } from "@/domain/entities/base.entity";

/**
 * Thực thể Báo cáo (Report Entity)
 * 
 * Đại diện cho các báo cáo phân tích cấp cao, liên kết tới các tài liệu/nguồn lực đã được tạo ra.
 */
export const ReportEntitySchema = BaseEntitySchema.extend({
  /** Mã định danh duy nhất của bản ghi báo cáo */
  reportId: z.string(),
  /** Loại báo cáo hệ thống (VD: SALE, PRODUCT, USER...) */
  reportType: ReportType,
  /** ID của quản trị viên đã tạo hoặc quản lý báo cáo này */
  adminId: z.string(),
  /** Tiêu đề gợi nhớ cho báo cáo (VD: 'Doanh thu tháng 1') */
  name: z.string(),
  /** Đường dẫn trực tiếp hoặc liên kết tới tài liệu/dữ liệu báo cáo thực tế */
  link: z.url(),
});

/** Kiểu dữ liệu TypeScript cho các thực thể báo cáo tổng hợp */
export type ReportEntity = z.infer<typeof ReportEntitySchema>;
