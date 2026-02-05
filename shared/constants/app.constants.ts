/**
 * Application-wide constants
 */

// ===========================================
// App Configuration
// ===========================================

export const APP_CONFIG = {
    /** Application name */
    APP_NAME: 'Lạc Lạc Shop',

    /** Default locale */
    DEFAULT_LOCALE: 'vi-VN',

    /** Default currency */
    DEFAULT_CURRENCY: 'VND',

    /** Date format */
    DATE_FORMAT: 'dd/MM/yyyy',

    /** DateTime format */
    DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
} as const;

// ===========================================
// UI Constants
// ===========================================

export const UI_CONFIG = {
    /** Number of products per page */
    PRODUCTS_PER_PAGE: 12,

    /** Number of related products to show */
    RELATED_PRODUCTS_COUNT: 4,

    /** Number of popular items to show in filters */
    POPULAR_ITEMS_COUNT: 3,

    /** Maximum images in product gallery */
    MAX_GALLERY_IMAGES: 5,

    /** Debounce delay for search input (ms) */
    SEARCH_DEBOUNCE_MS: 300,

    /** Toast notification duration (ms) */
    TOAST_DURATION_MS: 3000,
} as const;

// ===========================================
// Validation Constants
// ===========================================

export const VALIDATION = {
    /** Minimum password length */
    MIN_PASSWORD_LENGTH: 6,

    /** Maximum password length */
    MAX_PASSWORD_LENGTH: 50,

    /** Minimum username length */
    MIN_USERNAME_LENGTH: 3,

    /** Maximum username length */
    MAX_USERNAME_LENGTH: 30,

    /** Maximum product name length */
    MAX_PRODUCT_NAME_LENGTH: 200,

    /** Maximum description length */
    MAX_DESCRIPTION_LENGTH: 2000,
} as const;

// ===========================================
// Product Status
// ===========================================

export const PRODUCT_STATUS = {
    AVAILABLE: 'AVAILABLE',
    UNAVAILABLE: 'UNAVAILABLE',
    OUT_OF_STOCK: 'OUT_OF_STOCK',
    DISCONTINUED: 'DISCONTINUED',
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

// ===========================================
// Order Status
// ===========================================

export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
