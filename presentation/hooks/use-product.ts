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
    // Khởi tạo queryClient để kiểm soát và tương tác với cache của TanStack
    const queryClient = useQueryClient();

    // Memoize search params để tránh re-create object dư thừa ở mỗi lần render, giúp tối ưu performance
    const searchParams = React.useMemo(() => buildSearchParams(params), [params]);

    // Lấy ra số trang hiện tại từ search params, mặc định là 0 (trang đầu tiên)
    const currentPage = searchParams.page ?? 0;

    // Đăng ký fetch data thông qua React Query (useQuery)
    const query = useQuery({
        // Dùng dynamic query params qua đối tượng `productKeys` nhằm quy định caching định danh thống nhất
        queryKey: productKeys.list(searchParams),

        // Chỉ định logic lấy Data bằng cách gọi Repository searchAndFilter từ tầng Infrastructure
        queryFn: () => ProductRepository.searchAndFilter(searchParams),

        // Option giữ nguyên hiển thị data cũ trên giao diện trong lúc gọi lấy trang mới (giúp tránh Layout Shift)
        placeholderData: keepPreviousData,

        // Gắn cấu hình chuẩn (retry rules, staleTime, gcTime)
        ...QUERY_CONFIG.STANDARD,
    });

    // Side Effect: Thực hiện prefetch data cho việc chuyển trang (Smoother UX)
    React.useEffect(() => {
        // Lấy tính tổng số pages có thể duyệt, mặc định an toàn là 1
        const totalPages = query.data?.count_pages ?? 1;

        // Nếu đã có data và user chưa duyệt tới trang cuối cùng
        if (query.data && currentPage < totalPages - 1) {
            // Chuẩn bị payload lấy hàng cho trang tiếp theo (currentPage + 1)
            const nextParams: ProductSearchParams = {
                ...searchParams,
                page: currentPage + 1,
            };

            // Yêu cầu queryClient tải ngầm (background) trang kế tiếp vào cache sớm
            queryClient.prefetchQuery({
                queryKey: productKeys.list(nextParams),
                queryFn: () => ProductRepository.searchAndFilter(nextParams),
            });
        }
    }, [currentPage, query.data, queryClient, searchParams]);

    // Trả ra các field được đóng gói sạch sẽ (abstract mapping) cho UI dễ mapping React component
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
