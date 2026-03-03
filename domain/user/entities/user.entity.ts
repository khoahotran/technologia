import { z } from "zod";

import { EmailSchema } from "../vo/email.vo";
import { PhoneNumberSchema } from "../vo/phone.vo";
import { UserRoleSchema } from "../vo/role.vo";
import { UserStatusSchema } from "../vo/status.vo";

import { BaseEntitySchema } from "@/domain/entities/base.entity";

/**
 * Thực thể Người dùng Hệ thống (User Entity)
 * 
 * Ánh xạ các trường thông tin người dùng từ backend sang Domain của Frontend.
 * Các trường như email, số điện thoại, vai trò và trạng thái sử dụng các Value Objects (VO)
 * để đảm bảo quy tắc nghiệp vụ và xác thực dữ liệu nghiêm ngặt.
 */
export const UserEntitySchema = BaseEntitySchema.extend({
  /** Mã định danh người dùng từ backend (string hoặc number) */
  userId: z.union([z.string(), z.number()]),
  /** Tên đăng nhập duy nhất */
  username: z.string(),
  /** Chuỗi mật khẩu đã băm (thường không hiển thị, nhưng lưu nếu API trả về) */
  passwordHash: z.string(),

  /** Value Object cho Số điện thoại đã được kiểm chuẩn */
  phoneNumber: PhoneNumberSchema,
  /** Value Object cho Địa chỉ Email đã được kiểm chuẩn */
  email: EmailSchema,

  /** Tên chính */
  firstName: z.string(),
  /** Họ và tên đệm */
  lastName: z.string(),

  /** URL ảnh đại diện (tùy chọn) */
  imageUrl: z.url().nullable().optional(),

  /** Trạng thái hiện tại (Hoạt động, Bị khóa...) sử dụng VO */
  status: UserStatusSchema,
  /** Vai trò đặc quyền (ADMIN, CUSTOMER...) sử dụng VO */
  role: UserRoleSchema,
});

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type UserEntity = z.infer<typeof UserEntitySchema>;
