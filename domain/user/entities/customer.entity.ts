import { z } from "zod";

import { UserEntitySchema } from "./user.entity";

/**
 * Thực thể Khách hàng (Customer Entity)
 * 
 * Mở rộng từ UserEntitySchema để bổ sung các thuộc tính dành riêng cho người dùng phổ thông.
 */
export const CustomerEntitySchema = UserEntitySchema.extend({
  /** Tên hiển thị công khai dùng để render trên giao diện (VD: Biệt danh) */
  displayName: z.string(),
  /** Hình thức đăng ký/đăng nhập của khách hàng */
  loginType: z.enum(["PASSWORD", "GOOGLE", "FACEBOOK"]).optional(),
  /** Cờ đánh dấu đây có phải là hồ sơ người dùng mặc định không */
  isDefault: z.boolean().optional(),
});

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type CustomerEntity = z.infer<typeof CustomerEntitySchema>;
