import z from "zod";

import { AccountNumberVO } from "../vo/account-number.vo";

import { BaseEntitySchema } from "@/domain/entities/base.entity";

/**
 * Thực thể Tài khoản Thanh toán (Payment Account Entity)
 * 
 * Đại diện cho các nguồn tiền thanh toán (Ngân hàng, Ví điện tử...).
 * Kế thừa các trường thời gian từ BaseEntitySchema.
 */
export const PaymentAccountEntitySchema = BaseEntitySchema.extend({
  /** Mã định danh mục tài khoản thanh toán */
  pAccountId: z.string(),
  /** Tên gợi nhớ cho tài khoản (VD: 'Thẻ ATM cá nhân') */
  name: z.string(),
  /** Tên tổ chức tài chính hoặc ngân hàng cung cấp */
  bankName: z.string(),
  /** Phân loại tài khoản */
  type: z.enum(["bank", "ewallet", "card"]),
  /** Trạng thái hoạt động của tài khoản */
  status: z.enum(["active", "inactive"]),
  /** Value Object cho số tài khoản/số thẻ đã validate */
  number: AccountNumberVO,
  /** Cờ đánh dấu tài khoản thanh toán ưu tiên (mặc định) */
  isDefault: z.boolean(),
  /** ID người dùng sở hữu tài khoản này */
  userId: z.string(),
});

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type PaymentAccountEntity = z.infer<typeof PaymentAccountEntitySchema>;
