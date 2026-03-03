import { z } from "zod";

/**
 * Đối tượng giá trị Email (Email Value Object)
 * 
 * Xác thực chuỗi nhập vào phải tuân thủ đúng định dạng email tiêu chuẩn.
 */
export const EmailSchema = z.string().email();

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type Email = z.infer<typeof EmailSchema>;
