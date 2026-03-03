/**
 * Tầng Domain - Trái tim của ứng dụng (Business Logic & Entities)
 *
 * Tầng này chứa các quy tắc nghiệp vụ cốt lõi, không phụ thuộc vào bất kỳ framework hay thư viện bên ngoài nào.
 * Bao gồm:
 * 1. Thực thể (Entities): Các đối tượng nghiệp vụ chính (Product, Cart, User...).
 * 2. Đối tượng truyền tải dữ liệu (DTOs): Định nghĩa cấu trúc dữ liệu cho các đầu vào/đầu ra.
 * 3. Giao diện (Interfaces): Định nghĩa các bản hợp đồng cho Repositories và Services.
 * 4. Lỗi nghiệp vụ (Errors): Các định nghĩa về lỗi đặc thù của ứng dụng.
 */

// ===========================================
// Product Domain - Nghiệp vụ Sản phẩm
// ===========================================

/** Các thực thể liên quan đến sản phẩm (Product, Category, Brand...) */
export * from "./product/entities";
export type { ProductVariantSchema, ProductEntitySchema } from "./product/entities/product.entity";
export type { FilterResponseEntitySchema } from "./product/entities/filter.entity";

/** Giao diện Repository cho Sản phẩm */
export type {
    IProductRepository,
    ProductPagingResponse,
    ProductSearchParams,
    FilterProductResponse,
} from "./product/repositories/product.repository.interface";

// ===========================================
// Cart Domain - Nghiệp vụ Giỏ hàng
// ===========================================

export * from "./cart/entities/cart.entity";
export * from "./cart/repositories/cart.repository.interface";

// ===========================================
// User Domain - Nghiệp vụ Người dùng & Xác thực
// ===========================================

/** Thực thể Người dùng (UserProfile, Role...) */
export * from "./user/entities";

/** Các DTO cho đăng ký, đăng nhập và hồ sơ */
export * from "./user/dto/auth.dto";

/** Giao diện Repository cho Xác thực (Login, Register...) */
export type {
    IAuthRepository,
    AuthResponse,
} from "./user/repositories/auth.repository.interface";
