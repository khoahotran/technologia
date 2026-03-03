import z from "zod";

/**
 * Bản phác thảo DTO dùng để tạo mới một bản ghi Nhật ký Hành động Quản trị.
 */
export const CreateAdminActionLogDtoSchema = z.object({
  /** Loại/Nhóm thực thể bị thay đổi */
  entityType: z.string(),
  /** Nhãn hành động đã thực hiện (VD: 'DELETE_PRODUCT') */
  action: z.string(),
  /** Ngữ cảnh hoặc lý do thực hiện hành động */
  note: z.string().nullable().optional(),
  /** ID của quản trị viên thực hiện hành động này */
  adminId: z.string(),
});

/** Kiểu dữ liệu TypeScript cho payload tạo nhật ký */
export type CreateAdminActionLogDto = z.infer<
  typeof CreateAdminActionLogDtoSchema
>;
