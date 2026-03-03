import z from "zod";

/**
 * Bản phác thảo DTO dùng để cập nhật thông tin Tài khoản Thanh toán hiện có.
 * Hỗ trợ cập nhật từng phần (Partial Update).
 */
export const UpdatePaymentAccountDtoSchema = z.object({
  /** Tên gợi nhớ mới cho tài khoản */
  name: z.string().optional(),
  /** Tên ngân hàng/nhà cung cấp mới */
  bankName: z.string().optional(),
  /** Thay đổi loại hình thanh toán */
  type: z.enum(["bank", "ewallet", "card"]).optional(),
  /** Cập nhật số tài khoản mới */
  number: z.string().optional(),
  /** Trạng thái vận hành mới */
  status: z.enum(["active", "inactive"]).optional(),
  /** Thiết lập hoặc hủy thiết lập làm tài khoản mặc định */
  isDefault: z.boolean().optional(),
});

/** Kiểu dữ liệu TypeScript cho yêu cầu cập nhật tài khoản thanh toán */
export type UpdatePaymentAccountDto = z.infer<typeof UpdatePaymentAccountDtoSchema>;
