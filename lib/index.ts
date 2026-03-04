/**
 * Thư mục Lib (Library) 
 * Tuyển tập các công cụ kỹ thuật (Technical utilities), trình Handler và Mock Data.
 * Khác với Shared Utils (thiên về logic rành mạch), Lib thường chứa các trình bao bọc (wrappers) 
 * cho các thư viện bên thứ 3 hoặc các bộ máy xử lý API Route của Next.js.
 */

// Công cụ cốt lõi & Hằng số
export * from "./utils";
export * from "./constants";

// Xử lý Lỗi & Kết quả
export * from "./result";

// Ghi nhận Log
export * from "./logger";

// Tiện ích API & Proxy
export * from "./fetch-auth";
export * from "./handle-response";
export * from "./api-handler";
export * from "./api-proxy";
export * from "./api-route";

// Dữ liệu giả lập & Luồng nghiệp vụ cũ
export * from "./mock-data";
export * from "./checkout-flow";
export * from "./store";
