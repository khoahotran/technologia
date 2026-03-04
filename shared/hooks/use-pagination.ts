"use client";

/**
 * Hook usePagination
 *
 * Tiện ích quản lý State chung (máy trạng thái) cho Phân trang và Sắp xếp của dữ liệu danh sách.
 * 
 * Tại sao cần?
 * Phân trang thường đi kèm rất nhiều params như page, limit(size), sortBy, direction... 
 * Thường xuyên có logic reset lại page = 0 khi đổi pageSize hoặc sortBy. 
 * Hook này giúp tái sử dụng toàn bộ logic đóng gói này ở bất kì đâu trong toàn app,
 * cho cả Data Grid Admin, List View Frontend.
 */

import * as React from "react";

export interface PaginationState {
    /** Số trang hiện hành (mặc định lấy 0 - dạng 0-indexed index) */
    page: number;
    /** Số lượng hiển thị 1 trang */
    size: number;
    /** Tên khóa dùng để Sort dữ liệu */
    sortBy: string;
    /** Khóa hướng xếp (ASC/DESC) */
    sortDirection: "ASC" | "DESC";
}

/** 
 * Các cấu hình tùy chỉnh khi khởi tạo Pagination State 
 */
export interface UsePaginationOptions {
    initialPage?: number;
    initialSize?: number;
    initialSortBy?: string;
    initialSortDirection?: "ASC" | "DESC";
}

export function usePagination(options?: UsePaginationOptions) {
    // Lưu trữ hằng số trạng thái gốc, tiện cho việc Reset
    const initialState = React.useMemo<PaginationState>(
        () => ({
            page: options?.initialPage ?? 0,
            size: options?.initialSize ?? 10,
            sortBy: options?.initialSortBy ?? "createdAt",
            sortDirection: options?.initialSortDirection ?? "DESC",
        }),
        // Bỏ qua cảnh báo ESLint, đây là trạng thái khởi đầu, ta ko muốn nó update lại
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // Context chính cho State Phân Trạng
    const [pagination, setPagination] = React.useState<PaginationState>(initialState);

    /** Điều hướng qua lại giữa các trang */
    const setPage = React.useCallback((page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    }, []);

    /** Thay đổi Size (Kích thước hiển thị) -> Luôn kéo về Trang Đầu Tiên = 0 để tránh lỗi UI (văng ra page ảo) */
    const setSize = React.useCallback((size: number) => {
        setPagination((prev) => ({ ...prev, size, page: 0 }));
    }, []);

    /** Thay đổi bộ lọc Sắp Xếp (Sort) -> Luôn kéo người dùng về Trang Đầu Tiên = 0 */
    const setSortBy = React.useCallback((sortBy: string) => {
        setPagination((prev) => ({ ...prev, sortBy, page: 0 }));
    }, []);

    /** Thay đổi chiều Sắp Xếp (ASC hoặc DESC) */
    const setSortDirection = React.useCallback((sortDirection: "ASC" | "DESC") => {
        setPagination((prev) => ({ ...prev, sortDirection }));
    }, []);

    /** Đổi ngang / Đảo ngược chiều sắp xếp hiện tại */
    const toggleSortDirection = React.useCallback(() => {
        setPagination((prev) => ({
            ...prev,
            sortDirection: prev.sortDirection === "ASC" ? "DESC" : "ASC",
        }));
    }, []);

    /** Khởi tạo lại tất cả mọi tuỳ chọn về thông số được config ban đầu */
    const reset = React.useCallback(() => {
        setPagination(initialState);
    }, [initialState]);

    return {
        ...pagination, // Gói gộp properties tĩnh: page, size, sortBy, sortDirection lại thành root
        setPage,
        setSize,
        setSortBy,
        setSortDirection,
        toggleSortDirection,
        reset,
    };
}
