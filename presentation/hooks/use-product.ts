/**
 * Product-related hooks for Presentation Layer
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
import { QUERY_CONFIG } from "@/shared/constants/query.constants";

// ===========================================
// Query Keys
// ===========================================

export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (params: ProductSearchParams) => [...productKeys.lists(), params] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: string | number) => [...productKeys.details(), id] as const,
    search: (query: string) => [...productKeys.all, "search", query] as const,
    brands: () => [...productKeys.all, "brands"] as const,
    categories: () => [...productKeys.all, "categories"] as const,
};

// ===========================================
// Types
// ===========================================

export interface ProductListParams extends Partial<ProductSearchParams> {
    search?: string;
}

function buildSearchParams({
    page = 0,
    size = REQUEST_CONFIG.DEFAULT_PAGE_SIZE,
    sortBy = "id",
    sortDirection = "DESC",
    search,
    ...filters
}: ProductListParams = {}): ProductSearchParams {
    const params: ProductSearchParams = {
        page,
        size,
        sortBy,
        sortDirection,
        ...filters,
    };

    if (search) {
        params.keyword = search;
    }

    return params;
}

// ===========================================
// Hooks
// ===========================================

/**
 * Hook for fetching paginated products with filters
 */
export function useProductList(params: ProductListParams = {}) {
    const queryClient = useQueryClient();
    const searchParams = React.useMemo(() => buildSearchParams(params), [params]);
    const currentPage = searchParams.page ?? 0;

    const query = useQuery({
        queryKey: productKeys.list(searchParams),
        queryFn: () => ProductRepository.searchAndFilter(searchParams),
        placeholderData: keepPreviousData,
        ...QUERY_CONFIG.STANDARD,
    });

    // Prefetch next page for smoother UX
    React.useEffect(() => {
        const totalPages = query.data?.count_pages ?? 1;
        if (query.data && currentPage < totalPages - 1) {
            const nextParams: ProductSearchParams = {
                ...searchParams,
                page: currentPage + 1,
            };
            queryClient.prefetchQuery({
                queryKey: productKeys.list(nextParams),
                queryFn: () => ProductRepository.searchAndFilter(nextParams),
            });
        }
    }, [currentPage, query.data, queryClient, searchParams]);

    return {
        products: query.data?.data ?? [],
        totalPages: query.data?.count_pages ?? 0,
        totalItems: query.data?.count_items ?? 0,
        currentPage: query.data?.page_number ?? 0,
        isLoading: query.isLoading,
        isError: query.isError,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook for single product details
 */
export function useProductDetail(productId: string | number | undefined) {
    const query = useQuery({
        queryKey: productKeys.detail(productId ?? ""),
        queryFn: () => ProductRepository.getById(productId!),
        enabled: !!productId,
        ...QUERY_CONFIG.STANDARD,
    });

    return {
        product: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
}
