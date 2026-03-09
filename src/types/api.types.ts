/**
 * Lớp kiểu dữ liệu API (API Response Types)
 * Tập trung các định nghĩa kiểu dữ liệu chuẩn (Type Definitions) dùng chung cho luồng gửi / nhận API.
 */

// Khuôn mẫu phản hồi chung (Generic API Response wrapper) cho đa số API
export interface ApiResponse<T> {
    status: number;
    data: T;
    message: string;
}

// Khuôn mẫu phản hồi có Phân trang (Paginated Response) dành cho các API danh sách
export interface PaginatedResponse<T> {
    status: number;
    page_number: number;
    page_size: number;
    count_items: number;
    count_pages: number;
    data: T[];
    message: string;
}

/**
 * Domain-friendly paginated response (camelCase)
 * Standardized across the application layer.
 */
export interface DomainPaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

// Cấu trúc lỗi chuẩn trả về từ API
export interface ApiError {
    status: number;
    message: string;
    error?: string;
    timestamp?: string;
}

// Giao diện (Context) cho các Route trên Next.js App Router (Backend)
export interface RouteContext<T extends Record<string, string> = Record<string, string>> {
    params: Promise<T>;
}

// Các phương thức HTTP hợp lệ
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Cấu hình tham số cho mỗi lần gọi API
export interface RequestConfig {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    params?: Record<string, string | number | undefined>; // Query parameters
    timeout?: number;
}

// Cấu trúc của Tokens dùng để xác thực (Authentication)
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    userId?: number;
}

// Tham số đầu vào cho một thao tác Phân trang khi gọi API
export interface PaginationParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}
