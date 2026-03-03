import z from "zod";

import { EntityType } from "../vo/entity-type.vo";

import { BaseEntitySchema } from "@/domain/entities/base.entity";

/**
 * Thực thể Nhật ký Hành động Quản trị (Admin Action Log Entity)
 * 
 * Ghi lại các thay đổi cụ thể do người dùng quản trị thực hiện (Audit Trail)
 * phục vụ mục đích bảo mật và truy vết lịch sử.
 */
export const AdminActionLogEntitySchema = BaseEntitySchema.extend({
  /** Mã định danh duy nhất của bản ghi nhật ký */
  logId: z.string(),
  /** Loại đối tượng domain bị tác động bởi hành động này */
  entityType: EntityType,
  /** Mô tả hành động thực hiện (VD: CREATE, UPDATE, DELETE...) */
  action: z.string(),
  /** Ghi chú hoặc ngữ cảnh bổ sung cho hành động (tùy chọn) */
  note: z.string().nullable().optional(),
  /** ID của tài khoản Admin đã thực hiện thao tác này */
  adminId: z.string(),
});

/** Kiểu dữ liệu TypeScript cho hồ sơ hoạt động của admin */
export type AdminActionLogEntity = z.infer<
  typeof AdminActionLogEntitySchema
>;
