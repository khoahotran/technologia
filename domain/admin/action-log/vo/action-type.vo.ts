import { z } from "zod";

/**
 * Đối tượng giá trị Loại Hành động (Action Type Value Object)
 * 
 * Định nghĩa danh sách các loại thao tác quản trị (VD: Tạo mới, Cập nhật, Xóa, Khóa, Phê duyệt).
 */
export const ActionType = z.enum(["CREATE", "UPDATE", "DELETE", "LOCK", "APPROVE"]);

/** Kiểu dữ liệu TypeScript cho các hành động quản trị */
export type ActionType = z.infer<typeof ActionType>;
