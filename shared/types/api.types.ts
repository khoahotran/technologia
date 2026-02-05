/**
 * API Response Types
 * Centralized type definitions for API responses
 */

// Generic API Response wrapper
export interface ApiResponse<T> {
    status: number;
    data: T;
    message: string;
}

// Paginated Response for list endpoints
export interface PaginatedResponse<T> {
    status: number;
    page_number: number;
    page_size: number;
    count_items: number;
    count_pages: number;
    data: T[];
    message: string;
}

// API Error structure
export interface ApiError {
    status: number;
    message: string;
    error?: string;
    timestamp?: string;
}

// Route context for Next.js API routes
export interface RouteContext<T extends Record<string, string> = Record<string, string>> {
    params: Promise<T>;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request config for API calls
export interface RequestConfig {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    params?: Record<string, string | number | undefined>;
    timeout?: number;
}

// Auth tokens structure
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    userId?: number;
}

// Pagination params for queries
export interface PaginationParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}
