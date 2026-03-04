import { z } from "zod";

//
// ==========================
// Response DTO Template (Khuôn mẫu DTO cho Phản hồi API)
// ==========================
//

/**
 * Lược đồ cơ bản (Base Schema) chứa các trường bắt buộc cho MỌI phản hồi API.
 */
export const responseBaseSchema = z.object({
  statusCode: z.number().int().describe("Mã trạng thái HTTP của phản hồi (Ví dụ: 200, 400)."),
  message: z
    .string()
    .describe("Thông điệp chú thích thân thiện dành cho con người đọc."),
  timestamp: z.string().datetime()
    .describe("Dấu thời gian chuẩn ISO 8601 ghi nhận lúc tạo phản hồi."),
  url: z.string().url().describe("Đường dẫn URL gốc của yêu cầu."),
  method: z
    .string()
    .describe("Phương thức HTTP gốc (GET, POST, PUT, DELETE, etc.)."),
});

/**
 * Lược đồ chuẩn cho các phản hồi LỖI (Error Response).
 */
export const errorResponseSchema = responseBaseSchema.extend({
  success: z
    .literal(false)
    .describe("Cờ đánh dấu yêu cầu đã thất bại."),
  error: z
    .any()
    .optional()
    .describe("Chi tiết lỗi bổ sung mục đích cho debug hoặc báo cho máy khách."),
});

// Kiểu dữ liệu Phản hồi Lỗi bằng TypeScript
export type ErrorResponseDto = z.infer<typeof errorResponseSchema>;

/**
 * Hàm khởi tạo Lược đồ Phản hồi THÀNH CÔNG (Success Response Schema).
 * Gói gọn payload dữ liệu thực tế vào thuộc tính `result`.
 * 
 * @param resultSchema Schema quy định cấu trúc dữ liệu trả về mong đợi.
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(
  resultSchema: T
) {
  return responseBaseSchema.extend({
    success: z
      .literal(true)
      .describe("Cờ đánh dấu yêu cầu đã thực thi thành công."),
    result: resultSchema.describe("Dữ liệu tải trọng của phản hồi thành công."),
  });
}

/**
 * Hàm khởi tạo Lược đồ Phản hồi Tiêu chuẩn API.
 * Nó là trường hợp tổng quát, kết hợp cả THÀNH CÔNG và LỖI (Discriminated Union 
 * thông qua biến cờ `success`).
 * 
 * Giúp TypeScript tự động thu hẹp kiểu dữ liệu (từ union) nếu ta kiểm tra `if (response.success)`.
 */
export function createResponseSchema<T extends z.ZodTypeAny>(resultSchema: T) {
  return z.discriminatedUnion("success", [
    createSuccessResponseSchema(resultSchema),
    errorResponseSchema,
  ]);
}

/**
 * Type helper để trích xuất kiểu dữ liệu TS từ chuẩn API Response
 */
export type ResponseDto<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createResponseSchema<T>>
>;
