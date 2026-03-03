import { z } from "zod";

/**
 * Đối tượng giá trị Số điện thoại (Phone Number Value Object)
 * 
 * Xác thực chuỗi nhập vào là một số điện thoại có độ dài từ 8 đến 15 ký tự.
 * Giúp nhận diện và ngăn chặn các số điện thoại quốc tế không đúng định dạng.
 */
export const PhoneNumberSchema = z.string().min(8).max(15);

/** Kiểu dữ liệu TypeScript suy diễn từ Schema */
export type PhoneNumber = z.infer<typeof PhoneNumberSchema>;
