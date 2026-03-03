import { z } from "zod";

import { AddressEntitySchema } from "../entities/address.entity";
import { AdminEntitySchema } from "../entities/admin.entity";
import { CustomerEntitySchema } from "../entities/customer.entity";
import { UserPublicSchema } from "../entities/user-public.entity";
import { UserEntitySchema } from "../entities/user.entity";

import { createSuccessResponseSchema } from "@/shared/response/response.dto";

// --------------------------------------------------
// 1. Phản hồi cho một Người dùng đơn lẻ (Base User)
// --------------------------------------------------
/** Bản phác thảo phản hồi cho thông tin người dùng cơ bản */
export const UserResponseSchema = createSuccessResponseSchema(UserEntitySchema);
export type UserResponse = z.infer<typeof UserResponseSchema>;

// --------------------------------------------------
// 2. Phản hồi đầy đủ cho Khách hàng (User + Thông tin Customer + Danh sách Địa chỉ)
// --------------------------------------------------
/** Bản phác thảo phản hồi đầy đủ cho khách hàng, bao gồm tài khoản, định danh khách hàng và các địa chỉ */
export const CustomerFullResponseSchema = createSuccessResponseSchema(
  z.object({
    /** Thông tin tài khoản người dùng */
    user: UserEntitySchema,
    /** Thông tin định danh khách hàng */
    customer: CustomerEntitySchema,
    /** Danh sách các địa chỉ đã lưu */
    addresses: z.array(AddressEntitySchema),
  })
);
export type CustomerFullResponse = z.infer<typeof CustomerFullResponseSchema>;

// --------------------------------------------------
// 3. Phản hồi đầy đủ cho Quản trị viên (User + Thông tin Admin)
// --------------------------------------------------
/** Bản phác thảo phản hồi đầy đủ cho quản trị viên */
export const AdminFullResponseSchema = createSuccessResponseSchema(
  z.object({
    /** Thông tin tài khoản người dùng */
    user: UserEntitySchema,
    /** Thông tin quyền hạn/cấp độ admin */
    admin: AdminEntitySchema,
  })
);
export type AdminFullResponse = z.infer<typeof AdminFullResponseSchema>;

// --------------------------------------------------
// 4. Danh sách Người dùng có phân trang
// --------------------------------------------------
/** Bản phác thảo phản hồi danh sách người dùng có hỗ trợ phân trang */
export const PaginatedUsersResponseSchema = createSuccessResponseSchema(
  z.object({
    /** Mảng dữ liệu người dùng */
    data: z.array(UserEntitySchema),
    /** Thông báo phân trang */
    pagination: z.object({
      /** Trang hiện tại */
      currentPage: z.number(),
      /** Tổng số người dùng */
      totalItems: z.number(),
      /** Có trang sau không */
      hasNextPage: z.boolean(),
      /** Có trang trước không */
      hasPreviousPage: z.boolean(),
      /** Giới hạn mỗi trang */
      limit: z.number(),
    }),
  })
);

export type PaginatedUsersResponse = z.infer<typeof PaginatedUsersResponseSchema>;

/** Bản phác thảo phản hồi cho thông tin công khai của người dùng */
export const UserPublicResponseSchema = createSuccessResponseSchema(
  UserPublicSchema
);

export type UserPublicResponse = z.infer<typeof UserPublicResponseSchema>;