import { z } from "zod";

/**
 * Đối tượng giá trị Vai trò (User Role Value Object)
 * 
 * Đảm bảo vai trò của người dùng phải khớp chính xác với các quyền hạn đã định nghĩa trong ứng dụng.
 */
export const UserRoleSchema = z.enum(["ADMIN", "CUSTOMER"]);

/** Kiểu dữ liệu TypeScript suy diễn từ Schema */
export type UserRole = z.infer<typeof UserRoleSchema>;
