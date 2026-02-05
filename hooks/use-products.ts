/**
 * Products Hooks
 *
 * Optimized React Query hooks for product management.
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates
 * - Error handling with Result type
 * - Type-safe query keys
 */

"use client";

import {
    useQuery,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import * as React from "react";

import type { ProductSearchParams } from "@/domain/product/repositories/product.repository.interface";
import { ProductRepository } from "@/infrastructure/repositories/product/product.repository";
import { REQUEST_CONFIG } from "@/shared/constants";

// ===========================================
// Query Keys Factory
// ===========================================

export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (params: ProductSearchParams) => [...productKeys.lists(), params] as const,
    paged: (page: number, size: number, sortBy: string, sortDirection: string) =>
        [...productKeys.all, "paged", { page, size, sortBy, sortDirection }] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: string | number) => [...productKeys.details(), id] as const,
    search: (query: string) => [...productKeys.all, "search", query] as const,
};

// Legacy export for backwards compatibility
export const PRODUCT_KEYS = productKeys;

// ===========================================
// Types
// ===========================================

export interface ProductListParams {
    page?: number | undefined;
    size?: number | undefined;
    search?: string | undefined;
    categoryId?: number | undefined;
    brandId?: number | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    sortBy?: string | undefined;
    sortDirection?: "ASC" | "DESC" | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}

// ===========================================
// Legacy Hook (Backwards Compatible)
// ===========================================

export const useProducts = () => {
    const usePagedProducts = (
        page = 0,
        size = 10,
        sortBy = "id",
        sortDirection = "DESC"
    ) => {
        return useQuery({
            queryKey: productKeys.paged(page, size, sortBy, sortDirection),
            queryFn: () => ProductRepository.getPaged(page, size, sortBy, sortDirection),
            placeholderData: keepPreviousData,
            staleTime: 5 * 60 * 1000, // 5 minutes
        });
    };

    const useSearchProducts = (params: ProductSearchParams) => {
        return useQuery({
            queryKey: productKeys.list(params),
            queryFn: () => ProductRepository.searchAndFilter(params),
            placeholderData: keepPreviousData,
            staleTime: 5 * 60 * 1000,
        });
    };

    const useProductDetail = (id: string | number) => {
        return useQuery({
            queryKey: productKeys.detail(id),
            queryFn: () => ProductRepository.getById(id),
            enabled: !!id,
            staleTime: 10 * 60 * 1000, // 10 minutes
        });
    };

    return {
        usePagedProducts,
        useSearchProducts,
        useProductDetail,
    };
};

// ===========================================
// Modern Hooks (New API)
// ===========================================

/**
 * Hook for fetching paginated products with filters
 */
export function useProductList(params: ProductListParams = {}) {
    const queryClient = useQueryClient();

    const {
        page = 0,
        size = REQUEST_CONFIG.DEFAULT_PAGE_SIZE,
        sortBy = "id",
        sortDirection = "DESC",
        search,
        ...filters
    } = params;

    // Map frontend params to repository params
    const searchParams: ProductSearchParams = {
        page,
        size,
        sortBy,
        sortDirection,
        keyword: search,
        ...filters,
    };

    const query = useQuery({
        queryKey: productKeys.list(searchParams),
        queryFn: () => ProductRepository.searchAndFilter(searchParams),
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
    });

    // Prefetch next page for smoother pagination
    React.useEffect(() => {
        if (query.data && page < (query.data.count_pages ?? 1) - 1) {
            const nextParams: ProductSearchParams = { ...searchParams, page: page + 1 };
            queryClient.prefetchQuery({
                queryKey: productKeys.list(nextParams),
                queryFn: () => ProductRepository.searchAndFilter(nextParams),
            });
        }
    }, [query.data, page, searchParams, queryClient]);

    // Map repository response to convenient frontend structure
    return {
        products: query.data?.data ?? [],
        totalPages: query.data?.count_pages ?? 0,
        totalItems: query.data?.count_items ?? 0,
        currentPage: query.data?.page_number ?? 0,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook for fetching single product details
 */
export function useProductDetail(productId: string | number | undefined) {
    const query = useQuery({
        queryKey: productKeys.detail(productId ?? ""),
        queryFn: () => ProductRepository.getById(productId!),
        enabled: !!productId,
        staleTime: 10 * 60 * 1000,
    });

    return {
        product: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook for product search with debouncing
 */
export function useProductSearch(searchQuery: string, debounceMs: number = 300) {
    const [debouncedQuery, setDebouncedQuery] = React.useState(searchQuery);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, debounceMs);

        return () => clearTimeout(handler);
    }, [searchQuery, debounceMs]);

    const params: ProductSearchParams = {
        keyword: debouncedQuery,
        page: 0,
        size: 10,
    };

    const query = useQuery({
        queryKey: productKeys.search(debouncedQuery),
        queryFn: () => ProductRepository.searchAndFilter(params),
        enabled: debouncedQuery.length >= 2,
        staleTime: 60 * 1000,
    });

    return {
        results: query.data?.data ?? [],
        isLoading: query.isLoading && debouncedQuery.length >= 2,
        isSearching: searchQuery !== debouncedQuery,
    };
}
