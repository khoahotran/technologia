"use client";

import {
    useQuery,
    useMutation,
    keepPreviousData,
    type QueryKey,
} from "@tanstack/react-query";
import * as React from "react";

const FIVE_MINUTES = 5 * 60 * 1000;

// ===========================================
// Types
// ===========================================

export interface UseApiOptions<TData, TError = Error> {
    /** Whether the query is enabled */
    enabled?: boolean;
    /** Keep previous data while fetching new data */
    keepPreviousData?: boolean;
    /** Stale time in milliseconds */
    staleTime?: number;
    /** Cache time in milliseconds */
    cacheTime?: number;
    /** Retry count on error */
    retry?: number | boolean;
    /** Initial data */
    initialData?: TData;
    /** On success callback */
    onSuccess?: (data: TData) => void;
    /** On error callback */
    onError?: (error: TError) => void;
}

export interface UseApiMutationOptions<TData, TVariables, TError = Error> {
    /** On success callback */
    onSuccess?: (data: TData, variables: TVariables) => void;
    /** On error callback */
    onError?: (error: TError, variables: TVariables) => void;
    /** On mutation completion (regardless of success/error) */
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

// ===========================================
// Generic API Query Hook
// ===========================================

/**
 * Generic hook for API queries
 * Provides consistent loading, error, and data states
 */
export function useApiQuery<TData, TError = Error>(
    queryKey: QueryKey,
    queryFn: () => Promise<TData>,
    options?: UseApiOptions<TData, TError>
) {
    const {
        enabled = true,
        keepPreviousData: keepPrevious = false,
        staleTime = FIVE_MINUTES,
        cacheTime,
        retry = 1,
        initialData,
        onSuccess,
        onError,
    } = options || {};

    const query = useQuery({
        queryKey,
        queryFn,
        enabled,
        placeholderData: keepPrevious ? keepPreviousData : undefined,
        staleTime,
        ...(cacheTime !== undefined && { gcTime: cacheTime }),
        retry,
        initialData,
    });

    // Handle success/error callbacks
    React.useEffect(() => {
        if (query.isSuccess && onSuccess && query.data !== undefined) {
            onSuccess(query.data as TData);
        }
    }, [query.isSuccess, query.data, onSuccess]);

    React.useEffect(() => {
        if (query.isError && onError) {
            onError(query.error as TError);
        }
    }, [query.isError, query.error, onError]);

    return query;
}

// ===========================================
// Generic API Mutation Hook
// ===========================================

/**
 * Generic hook for API mutations (POST, PUT, DELETE)
 * Provides consistent mutation handling with callbacks
 */
export function useApiMutation<TData, TVariables, TError = Error>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseApiMutationOptions<TData, TVariables, TError>
) {
    const { onSuccess, onError, onSettled } = options || {};

    return useMutation({
        mutationFn,
        onSuccess: (data, variables) => {
            onSuccess?.(data, variables);
        },
        onError: (error, variables) => {
            onError?.(error as TError, variables);
        },
        onSettled: (data, error, variables) => {
            onSettled?.(data, error as TError | null, variables);
        },
    });
}

// ===========================================
// Pagination Helper Hook
// ===========================================

export interface PaginationState {
    page: number;
    size: number;
    sortBy: string;
    sortDirection: "ASC" | "DESC";
}

export interface UsePaginationOptions {
    /** Initial page number */
    initialPage?: number;
    /** Initial page size */
    initialSize?: number;
    /** Initial sort field */
    initialSortBy?: string;
    /** Initial sort direction */
    initialSortDirection?: "ASC" | "DESC";
}

/**
 * Hook for managing pagination state
 */
export function usePagination(options?: UsePaginationOptions) {
    const initialState = React.useMemo<PaginationState>(() => ({
        page: options?.initialPage ?? 0,
        size: options?.initialSize ?? 10,
        sortBy: options?.initialSortBy ?? "createdAt",
        sortDirection: options?.initialSortDirection ?? "DESC",
    }), [options?.initialPage, options?.initialSize, options?.initialSortBy, options?.initialSortDirection]);

    const [pagination, setPagination] = React.useState<PaginationState>({
        page: initialState.page,
        size: initialState.size,
        sortBy: initialState.sortBy,
        sortDirection: initialState.sortDirection,
    });

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

// ===========================================
// Debounce Hook
// ===========================================

/**
 * Hook for debouncing a value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
