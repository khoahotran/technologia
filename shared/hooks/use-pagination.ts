"use client";

/**
 * usePagination Hook
 *
 * Generic pagination state manager — tracks page, size, sort.
 * Moved from presentation/hooks/use-api.hook.ts to shared/hooks/
 * so it can be consumed from any layer.
 */

import * as React from "react";

export interface PaginationState {
    page: number;
    size: number;
    sortBy: string;
    sortDirection: "ASC" | "DESC";
}

export interface UsePaginationOptions {
    initialPage?: number;
    initialSize?: number;
    initialSortBy?: string;
    initialSortDirection?: "ASC" | "DESC";
}

export function usePagination(options?: UsePaginationOptions) {
    const initialState = React.useMemo<PaginationState>(
        () => ({
            page: options?.initialPage ?? 0,
            size: options?.initialSize ?? 10,
            sortBy: options?.initialSortBy ?? "createdAt",
            sortDirection: options?.initialSortDirection ?? "DESC",
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const [pagination, setPagination] = React.useState<PaginationState>(initialState);

    const setPage = React.useCallback((page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    }, []);

    const setSize = React.useCallback((size: number) => {
        setPagination((prev) => ({ ...prev, size, page: 0 }));
    }, []);

    const setSortBy = React.useCallback((sortBy: string) => {
        setPagination((prev) => ({ ...prev, sortBy, page: 0 }));
    }, []);

    const setSortDirection = React.useCallback((sortDirection: "ASC" | "DESC") => {
        setPagination((prev) => ({ ...prev, sortDirection }));
    }, []);

    const toggleSortDirection = React.useCallback(() => {
        setPagination((prev) => ({
            ...prev,
            sortDirection: prev.sortDirection === "ASC" ? "DESC" : "ASC",
        }));
    }, []);

    const reset = React.useCallback(() => {
        setPagination(initialState);
    }, [initialState]);

    return {
        ...pagination,
        setPage,
        setSize,
        setSortBy,
        setSortDirection,
        toggleSortDirection,
        reset,
    };
}
