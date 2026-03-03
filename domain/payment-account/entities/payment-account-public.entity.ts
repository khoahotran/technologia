import type { z } from "zod";

import { PaymentAccountEntitySchema } from "./payment-account.entity";

/**
 * Bản phác thảo Tài khoản Thanh toán Công khai (Payment Account Public Schema)
 * 
 * Lược bỏ trường userId nhạy cảm khi truyền tải dữ liệu tới UI
 * để đảm bảo tính đóng gói và an toàn thông tin.
 */
export const PaymentAccountPublicSchema = PaymentAccountEntitySchema.omit({
  userId: true,
});

/** Kiểu dữ liệu TypeScript cho dữ liệu tài khoản thanh toán công khai */
export type PaymentAccountPublic = z.infer<typeof PaymentAccountPublicSchema>;
