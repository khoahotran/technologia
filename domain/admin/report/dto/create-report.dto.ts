import z from "zod";

import { ReportType } from "../vo";

/**
 * Bản phác thảo DTO dùng để tạo mới hoặc đính kèm một bản ghi Báo cáo.
 */
export const CreateReportDtoSchema = z.object({
  /** Loại báo cáo cần tạo */
  reportType: ReportType,
  /** Tiêu đề hiển thị cho báo cáo mới */
  name: z.string(),
  /** Đường dẫn nguồn chứa ngữ cảnh báo cáo */
  link: z.url(),
  /** ID của quản trị viên bắt đầu yêu cầu này */
  adminId: z.string(),
});

/** Kiểu dữ liệu TypeScript cho payload tạo báo cáo */
export type CreateReportDto = z.infer<typeof CreateReportDtoSchema>;
