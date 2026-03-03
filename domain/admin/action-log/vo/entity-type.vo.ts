import z from "zod";

/**
 * Đối tượng giá trị Loại Thực thể (Entity Type Value Object)
 * 
 * Định nghĩa danh sách các loại thực thể Domain mà một bản ghi nhật ký hành động có thể tham chiếu tới.
 */
export const EntityType = z.enum([
  "USER",
  "PRODUCT",
  "ORDER",
  "PAYMENT_ACCOUNT",
  "REPORT",
]);

/** Kiểu dữ liệu TypeScript cho các loại thực thể đích trong nhật ký */
export type EntityType = z.infer<typeof EntityType>;