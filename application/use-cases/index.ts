/**
 * Tầng Ứng dụng (Application Layer) — Nơi xuất khẩu Use-Cases
 *
 * Mọi Use-Cases (Kịch bản sử dụng) được tập hợp và xuất ra từ đây, 
 * để tầng kết xuất (Presentation - giao diện, hooks, page handlers) có thể gọi.
 */

// Kịch bản thao tác liên quan đến Sản Phẩm
export * from "./product";

export * from "./brand/use-brand";
export * from "./category/use-category";

// Kịch bản Xác Thực Người Dùng
export * from "./auth/login.use-case";
export * from "./auth/logout.use-case";

// Kịch bản Giỏ Hàng
export * from "./cart/add-to-cart.use-case";

// Kịch bản Thanh Toán (Checkout)
export * from "./checkout/checkout-flow.use-case";