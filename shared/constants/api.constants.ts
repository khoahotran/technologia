/**
 * API Constants
 * Centralized configuration for API endpoints and services
 * 
 * NOTE: When deploying to production, update these values in .env file
 */

// ===========================================
// Service Base URLs - Configure in .env
// ===========================================

/**
 * Backend service URLs
 * Default to localhost for development
 * Override with environment variables for production
 */
export const SERVICE_URLS = {
    /** Product service (products, brands, categories) */
    PRODUCT_SERVICE: process.env['NEXT_PUBLIC_PRODUCT_SERVICE_URL'] || 'http://localhost:8082',

    /** User service (auth, users, profiles) */
    USER_SERVICE: process.env['NEXT_PUBLIC_USER_SERVICE_URL'] || 'http://localhost:8081',

    /** Payment service (orders, payments) */
    PAYMENT_SERVICE: process.env['NEXT_PUBLIC_PAYMENT_SERVICE_URL'] || 'http://localhost:8083',

    /** Internal Next.js API (proxy) */
    INTERNAL_API: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000/api',
} as const;

// ===========================================
// API Paths - Organized by service
// ===========================================

export const API_PATHS = {
    // Auth endpoints
    AUTH: {
        LOGIN_LOCAL: '/api/auth/login/local',
        LOGIN_GOOGLE: '/api/auth/login/google',
        REGISTER: '/api/auth/register/local',
        LOGOUT: '/api/auth/logout',
        REFRESH_TOKEN: '/api/auth/refresh-token',
        FORGOT_PASSWORD: '/api/auth/forget-password',
        RESET_PASSWORD: '/api/auth/reset-password',
        ME: '/api/auth/me',
    },

    // Product endpoints  
    PRODUCTS: {
        BASE: '/api/products',
        BY_ID: (id: string | number) => `/api/products/${id}`,
        PAGED: '/api/products/paged',
        SEARCH_FILTER: '/api/products/search-filter',
    },

    // Brand endpoints
    BRANDS: {
        BASE: '/api/brands',
        BY_ID: (id: string | number) => `/api/brands/${id}`,
        PAGED: '/api/brands/paged',
    },

    // Category endpoints
    CATEGORIES: {
        BASE: '/api/categories',
        BY_ID: (id: string | number) => `/api/categories/${id}`,
        PAGED: '/api/categories/paged',
    },

    // User endpoints
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
    // Success
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,

    // Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,

    // Server Errors
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
} as const;

// ===========================================
// Request Configuration
// ===========================================

export const REQUEST_CONFIG = {
    /** Default timeout in milliseconds */
    TIMEOUT: 10000,

    /** Default page size for paginated requests */
    DEFAULT_PAGE_SIZE: 10,

    /** Maximum page size allowed */
    MAX_PAGE_SIZE: 100,

    /** Default sort direction */
    DEFAULT_SORT_DIRECTION: 'DESC' as const,

    /** Content type for JSON requests */
    JSON_CONTENT_TYPE: 'application/json',
} as const;

// ===========================================
// Local Storage Keys
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
// Cookie Names
// ===========================================

export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
} as const;
