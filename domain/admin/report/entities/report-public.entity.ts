import type { z } from "zod";

import { ReportEntitySchema } from "./report.entity";

/**
 * Bản phác thảo Báo cáo Công khai (Report Public Schema)
 * 
 * Phiên bản an toàn của Report Entity, lược bỏ trường adminId khi hiển thị danh sách cho người dùng.
 */
export const ReportPublicSchema = ReportEntitySchema.omit({
  adminId: true,
});

/** Kiểu dữ liệu TypeScript cho các mục báo cáo công khai an toàn */
export type ReportPublic = z.infer<typeof ReportPublicSchema>;
