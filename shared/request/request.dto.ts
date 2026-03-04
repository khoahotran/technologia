//
// ==========================
// Request DTO Template (Khuôn mẫu DTO cho các Yêu cầu)
// ==========================
//

import z from "zod";

/**
 * Hàm tạo Schema chuẩn cho mọi Request DTO (Data Transfer Object).
 * Bao bọc payload thực tế bằng định dạng tiêu chuẩn gồm: body, query, params, headers.
 * 
 * @param bodySchema Zod Schema mô tả cấu trúc của phần `body` trong request
 */
export function createRequestSchema<T extends z.ZodTypeAny>(bodySchema: T) {
  return z.object({
    body: bodySchema.describe("Dữ liệu tải trọng chính của yêu cầu (Payload)."),
    query: z
      .record(z.string(), z.string())
      .optional()
      .describe("Các tham số truy vấn trên URL (Query parameters)."),
    params: z
      .record(z.string(), z.string())
      .optional()
      .describe("Các tham số đường dẫn (Route parameters)."),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe("Các tiêu đề của yêu cầu (Headers)."),
  });
}

/**
 * Type helper để trích xuất kiểu dữ liệu TypeScript từ hàm `createRequestSchema`.
 */
export type RequestDto<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createRequestSchema<T>>
>;
