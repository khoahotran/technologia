/**
 * Tầng Infrastructure - Repositories
 * 
 * Lớp này chịu trách nhiệm triển khai (Implementation) cho các Interface định nghĩa ở tầng Domain.
 * Các Repositories sử dụng HttpClient (fetchWithToken) để giao tiếp với Backend.
 */

// Base repository (Nhà máy sản xuất repository CRUD chung)
export * from "./base.repository";

// Các Repository cụ thể cho từng nghiệp vụ (Domain-specific)
export * from "./auth";
export * from "./cart";
export * from "./product";
export * from "./user/user.repository"; // Xuất trực tiếp từ file vì chưa có index.ts ở thư mục con
