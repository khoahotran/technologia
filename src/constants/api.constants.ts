export const SERVICE_URLS = {
  PRODUCT_SERVICE: process.env["NEXT_PUBLIC_API_GATEWAY_URL"] || "http://localhost:8080",
  USER_SERVICE: process.env["NEXT_PUBLIC_API_GATEWAY_URL"] || "http://localhost:8080",
  PAYMENT_SERVICE: process.env["NEXT_PUBLIC_API_GATEWAY_URL"] || "http://localhost:8080",
  CART_SERVICE: process.env["NEXT_PUBLIC_API_GATEWAY_URL"] || "http://localhost:8080",
  INTERNAL_API: process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3000/api",
} as const;

export const API_PATHS = {
  AUTH: {
    LOGIN_LOCAL: "/api/auth/login/local",
    LOGIN_GOOGLE: "/api/auth/login/google",
    REGISTER: "/api/auth/register/local",
    LOGOUT: "/api/auth/logout",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    FORGOT_PASSWORD: "/api/auth/forget-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  PRODUCTS: {
    BASE: "/api/products",
    BY_ID: (id: string | number) => `/api/products/${id}`,
    PAGED: "/api/products/paged",
    SEARCH_FILTER: "/api/products/search-filter",
  },
  BRANDS: {
    BASE: "/api/brands",
    BY_ID: (id: string | number) => `/api/brands/${id}`,
    PAGED: "/api/brands/paged",
  },
  CATEGORIES: {
    BASE: "/api/categories",
    BY_ID: (id: string | number) => `/api/categories/${id}`,
    PAGED: "/api/categories/paged",
  },
  USERS: {
    BASE: "/api/users",
    BY_ID: (id: string | number) => `/api/users/${id}`,
    PROFILE: "/api/users/profile",
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const REQUEST_CONFIG = {
  TIMEOUT: 30000,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_DIRECTION: "DESC" as const,
  JSON_CONTENT_TYPE: "application/json",
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_ID: "user_id",
  USER_DATA: "user_data",
  CART: "cart",
  LANGUAGE: "language",
} as const;
