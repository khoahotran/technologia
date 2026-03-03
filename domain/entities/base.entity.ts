import { z } from "zod";

/**
 * Bản phác thảo Thực thể Cơ sở (Base Entity Schema)
 *
 * Định nghĩa các trường thông tin thời gian dùng chung cho tất cả các thực thể trong hệ thống.
 * Đảm bảo tính nhất quán trong việc theo dõi thời điểm tạo, cập nhật và xóa mềm (soft-delete).
 */
export const BaseEntitySchema = z
  .object({
    /** Thời điểm bản ghi được tạo mới */
    createdAt: z.coerce.date(),
    /** Thời điểm bản ghi được cập nhật lần cuối */
    updatedAt: z.coerce.date(),
    /** Thời điểm bản ghi bị xóa (dùng cho logic lưu trữ lịch sử hoặc phục hồi) */
    deletedAt: z.coerce.date().optional(),
  })

/**
 * Kiểu dữ liệu TypeScript suy diễn từ BaseEntitySchema.
 */
export type BaseEntity = z.infer<typeof BaseEntitySchema>;
