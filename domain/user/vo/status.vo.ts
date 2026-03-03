import { z } from "zod";

/**
 * Đối tượng giá trị Trạng thái Người dùng (User Status Value Object)
 * 
 * Định nghĩa các trạng thái khả thi của một tài khoản trong hệ thống.
 */
export const UserStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BANNED"]);

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type UserStatus = z.infer<typeof UserStatusSchema>;
