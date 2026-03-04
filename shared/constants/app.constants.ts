/**
 * Hằng số cấu hình cấp Ứng dụng (Application-wide constants)
 */

// ===========================================
// Cấu hình chung của App
// ===========================================

export const APP_CONFIG = {
    /** Tên ứng dụng hiển thị trên UI */
    APP_NAME: 'Lạc Lạc Shop',

    /** Ngôn ngữ khu vực mặc định */
    DEFAULT_LOCALE: 'vi-VN',

    /** Loại tiền tệ mặc định */
    DEFAULT_CURRENCY: 'VND',

    /** Định dạng ngày tháng */
    DATE_FORMAT: 'dd/MM/yyyy',

    /** Định dạng ngày giờ chi tiết */
    DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
} as const;

// ===========================================
// Hằng số Giao diện (UI Constants)
// ===========================================

export const UI_CONFIG = {
    /** Số lượng sản phẩm hiển thị trên một trang danh sách */
    PRODUCTS_PER_PAGE: 12,

    /** Số lượng sản phẩm liên quan hiển thị ở trang chi tiết */
    RELATED_PRODUCTS_COUNT: 4,

    /** Số lượng thẻ phổ biến (popular items) gợi ý trong bộ lọc */
    POPULAR_ITEMS_COUNT: 3,

    /** Số lượng hình ảnh tối đa trong thư viện ảnh của một sản phẩm */
    MAX_GALLERY_IMAGES: 5,

    /** Thời gian chờ delay (debounce) khi gõ tìm kiếm (ms) */
    SEARCH_DEBOUNCE_MS: 300,

    /** Thời gian hiển thị thông báo Toast (ms) */
    TOAST_DURATION_MS: 3000,
} as const;

// ===========================================
// Hằng số Xác thực dữ liệu (Validation Constants)
// ===========================================

export const VALIDATION = {
    /** Độ dài tối thiểu của mật khẩu */
    MIN_PASSWORD_LENGTH: 6,

    /** Độ dài tối đa của mật khẩu */
    MAX_PASSWORD_LENGTH: 50,

    /** Độ dài tối thiểu của tên đăng nhập (username) */
    MIN_USERNAME_LENGTH: 3,

    /** Độ dài tối đa của tên đăng nhập (username) */
    MAX_USERNAME_LENGTH: 30,

    /** Độ dài tối đa của tên sản phẩm */
    MAX_PRODUCT_NAME_LENGTH: 200,

    /** Độ dài tối đa của đoạn mô tả sản phẩm */
    MAX_DESCRIPTION_LENGTH: 2000,
} as const;

// ===========================================
// Trạng thái Sản phẩm (Product Status)
// ===========================================

export const PRODUCT_STATUS = {
    AVAILABLE: 'AVAILABLE', // Có sẵn
    UNAVAILABLE: 'UNAVAILABLE', // Không có sẵn
    OUT_OF_STOCK: 'OUT_OF_STOCK', // Hết hàng
    DISCONTINUED: 'DISCONTINUED', // Ngừng kinh doanh
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

// ===========================================
// Trạng thái Đơn hàng (Order Status)
// ===========================================

export const ORDER_STATUS = {
    PENDING: 'PENDING', // Chờ xử lý
    CONFIRMED: 'CONFIRMED', // Đã xác nhận
    PROCESSING: 'PROCESSING', // Đang chuẩn bị hàng
    SHIPPED: 'SHIPPED', // Đang giao
    DELIVERED: 'DELIVERED', // Đã giao thành công
    CANCELLED: 'CANCELLED', // Bị hủy
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
