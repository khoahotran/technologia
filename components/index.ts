/**
 * Thư mục Giao diện & Thành phần (Components Layer)
 * 
 * Nơi chứa toàn bộ các UI components của ứng dụng, được cấu trúc 
 * theo mô hình Atomic Design hoặc chia theo chức năng nghiệp vụ, bao gồm:
 * - ui: Thành phần nguyên tử, cơ bản (Buttons, Inputs, Cards...)
 * - shared: Thành phần dùng chung (Loading, Theme toggle...)
 * - features: Thành phần đặc thù, đóng gói logic nghiệp vụ nhất định (Header, ProductList...)
 */
export * from "./features";
export * from "./shared";
export * from "./ui";
