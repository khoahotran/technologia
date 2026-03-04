/**
 * Thư mục Shared (Lớp Chia Sẻ)
 * Tuyển tập các tài nguyên toàn cục (Global resources) được chia sẻ tự do 
 * ở bất cứ Tầng nào của dự án: Domain, Application, Infrastructure hay Presentation.
 * Mọi Layer đều có thể import thư mục này an toàn mà không sợ Tạp khuẩn mã nguồn (Cross-layer pollution).
 */

// Thực thể cốt lõi
export * from "./entities";

// Cấu trúc DTO truyền tải kết quả qua lại API
export * from "./request";
export * from "./response";

// Kiểu dữ liệu / Interface định dạng toàn ứng dụng
export * from "./types";

// Hằng số không thay đổi qua các môi trường
export * from "./constants";

// Công cụ Hỗ trợ và Logic lẻ
export * from "./utils/format";
export * from "./utils/validation";
export * from "./utils/result";
export * from "./utils/logger";

// Shared Hooks (Các Hooks có thể dùng cho cả Client-View và Admin-View)
export * from "./hooks";

// Context & Provider bao bọc chung React Tree
export * from "./providers";
