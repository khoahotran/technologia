import { z } from "zod";

import { UserEntitySchema } from "./user.entity";

/**
 * Thực thể Quản trị viên (Admin Entity)
 * 
 * Mở rộng từ UserEntitySchema để bổ sung các thuộc tính đặc thù dành cho cấp quản lý.
 */
export const AdminEntitySchema = UserEntitySchema.extend({
  /** Cấp độ quyền hạn của admin (VD: 1 cho Super Admin, 2 cho Moderator) */
  level: z.number(),
});

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type AdminEntity = z.infer<typeof AdminEntitySchema>;
