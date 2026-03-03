/**
 * Mô-đun Quản lý Trạng thái (State Management)
 *
 * Sử dụng thư viện Zustand để quản lý trạng thái toàn cục của ứng dụng ở phía Client.
 * Các Store được thiết kế để:
 * - Tự động lưu trữ (Persist) vào LocalStorage/Cookie khi cần.
 * - Cung cấp Selectors để tối ưu hóa việc Render của React.
 * - Tách biệt logic nghiệp vụ khỏi UI Components.
 */

export * from "./store.types";
export * from "./auth.store";
export * from "./cart.store";
export * from "./wishlist.store";
