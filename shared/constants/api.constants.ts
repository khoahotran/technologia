/**
 * Hằng số API (API Constants)
 * 
 * Cấu hình tập trung cho các endpoints và services của API.
 * LƯU Ý: Khi triển khai lên môi trường production, hãy cập nhật các giá trị này trong file .env
 */

// ===========================================
// Service Base URLs - Cấu hình trong .env
// ===========================================

/**
 * URL của các dịch vụ Backend
 * Mặc định trỏ về localhost cho môi trường phát triển (Development)
 * Ghi đè bằng các biến môi trường (Environment variables) cho Production
 */
export const SERVICE_URLS = {
    /** Dịch vụ Sản phẩm (quản lý products, brands, categories) */
    PRODUCT_SERVICE: process.env['NEXT_PUBLIC_API_GATEWAY_URL'] || 'http://localhost:8080',

    /** Dịch vụ Người dùng (quản lý auth, users, profiles) */
    USER_SERVICE: process.env['NEXT_PUBLIC_API_GATEWAY_URL'] || 'http://localhost:8080',

    /** Dịch vụ Thanh toán (quản lý orders, payments) */
    PAYMENT_SERVICE: process.env['NEXT_PUBLIC_API_GATEWAY_URL'] || 'http://localhost:8080',

    /** Dịch vụ Giỏ hàng (quản lý shopping cart) */
    CART_SERVICE: process.env['NEXT_PUBLIC_API_GATEWAY_URL'] || 'http://localhost:8080',

    /** Internal Next.js API (proxy dùng nội bộ frontend) */
    INTERNAL_API: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000/api',
} as const;

// ===========================================
// API Paths - Tổ chức theo từng service
// ===========================================

export const API_PATHS = {
    // Endpoints của Auth
    AUTH: {
        LOGIN_LOCAL: '/api/auth/login/local',
        LOGIN_GOOGLE: '/api/auth/login/google',
        REGISTER: '/api/auth/register/local',
        LOGOUT: '/api/auth/logout',
        REFRESH_TOKEN: '/api/auth/refresh-token',
        FORGOT_PASSWORD: '/api/auth/forget-password',
        RESET_PASSWORD: '/api/auth/reset-password',
    },

    // Endpoints của Product
    PRODUCTS: {
        BASE: '/api/products',
        BY_ID: (id: string | number) => `/api/products/${id}`,
        PAGED: '/api/products/paged',
        SEARCH_FILTER: '/api/products/search-filter',
    },

    // Endpoints của Brand
    BRANDS: {
        BASE: '/api/brands',
        BY_ID: (id: string | number) => `/api/brands/${id}`,
        PAGED: '/api/brands/paged',
    },

    // Endpoints của Category
    CATEGORIES: {
        BASE: '/api/categories',
        BY_ID: (id: string | number) => `/api/categories/${id}`,
        PAGED: '/api/categories/paged',
    },

    // Endpoints của User
    USERS: {
        BASE: '/api/users',
        BY_ID: (id: string | number) => `/api/users/${id}`,
        PROFILE: '/api/users/profile',
    },
} as const;

// ===========================================
// HTTP Status Codes
// ===========================================

export const HTTP_STATUS = {
    // Thành công (Success)
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,

    // Lỗi từ phía Client (Client Errors)
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,

    // Lỗi từ phía Server (Server Errors)
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
} as const;

// ===========================================
// Cấu hình Request
// ===========================================

export const REQUEST_CONFIG = {
    /** Thời gian chờ mặc định tính bằng mili-giây (30s) */
    TIMEOUT: 30000,


    /** Số lượng phần tử mặc định trên mỗi trang (Paginated requests) */
    DEFAULT_PAGE_SIZE: 10,

    /** Số lượng phần tử tối đa cho phép trên mỗi trang */
    MAX_PAGE_SIZE: 100,

    /** Chiều sắp xếp mặc định (Giảm dần) */
    DEFAULT_SORT_DIRECTION: 'DESC' as const,

    /** Định dạng Content type cho các request gửi JSON */
    JSON_CONTENT_TYPE: 'application/json',
} as const;

// ===========================================
// Khóa lưu trữ Local Storage
// ===========================================

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    USER_DATA: 'user_data',
    CART: 'cart',
    LANGUAGE: 'language',
} as const;

// ===========================================
// Tên Cookie
// ===========================================

export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
} as const;
