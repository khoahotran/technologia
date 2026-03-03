import z from "zod";

/**
 * Đối tượng giá trị Số tài khoản (Account Number Value Object)
 * 
 * Đảm bảo chuỗi số tài khoản chỉ chứa các chữ số từ 0-9.
 */
export const AccountNumberVO = z.string().regex(/^\d+$/, "Số tài khoản không hợp lệ");

/** Kiểu dữ liệu TypeScript cho chuỗi số tài khoản */
export type AccountNumber = z.infer<typeof AccountNumberVO>;
