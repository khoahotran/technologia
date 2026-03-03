/**
 * Kiểu phản hồi chung cho các kết quả API nhật ký hành động quản trị.
 * Hiện tại sử dụng cấu trúc Record linh hoạt và có thể mở rộng thêm.
 */
export type ActionLogResponse = Record<string, unknown>;
