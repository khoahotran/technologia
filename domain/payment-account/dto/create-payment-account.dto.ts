import z from "zod";

/**
 * Bản phác thảo DTO dùng để thêm mới một Tài khoản Thanh toán.
 */
export const CreatePaymentAccountDtoSchema = z.object({
  /** Tên gợi nhớ cho tài khoản */
  name: z.string(),
  /** Tên đầy đủ của ngân hàng hoặc nhà cung cấp ví */
  bankName: z.string(),
  /** Loại hình thanh toán */
  type: z.enum(["bank", "ewallet", "card"]),
  /** Chuỗi số tài khoản thô nhập từ giao diện */
  number: z.string(),
  /** Tùy chọn thiết lập làm tài khoản thanh toán mặc định ngay khi tạo */
  isDefault: z.boolean().optional().default(false),
});

/** Kiểu dữ liệu TypeScript cho yêu cầu tạo tài khoản thanh toán */
export type CreatePaymentAccountDto = z.infer<typeof CreatePaymentAccountDtoSchema>;
