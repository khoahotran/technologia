/**
 * Các React Hooks liên quan đến Sản phẩm cho Lớp Trình bày (Presentation Layer)
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
// Khóa Truy Vấn (Query Keys)
// ===========================================

/**
 * Quản lý tập trung các khóa cache cho Sản phẩm.
 * Giúp việc Invalidate cache hoặc update cache diễn ra chính xác hơn.
 */
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
// Kiểu dữ liệu (Types)
// ===========================================

export interface ProductListParams extends Partial<ProductSearchParams> {
    search?: string;
}

/**
 * Hàm trợ giúp xây dựng tham số tìm kiếm chuẩn từ các giá trị thô ở UI.
 */
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
// Các Hooks Chính
// ===========================================

/**
 * Hook `useProductList`: Truy vấn danh sách sản phẩm có kèm phân trang và bộ lọc.
 * 
 * Tính năng đặc biệt:
 * - Hỗ trợ `keepPreviousData`: Giữ lại dữ liệu trang cũ khi đang tải trang mới (tránh nháy màn hình).
 * - Tự động `prefetchQuery`: Tải trước dữ liệu của trang kế tiếp (Next page) để trải nghiệm mượt mà hơn.
 * 
 * @param params Các tùy chọn về trang, kích thước, sắp xếp và các bộ lọc (brand, category, price...)
 */
export function useProductList(params: ProductListParams = {}) {
    // Khởi tạo queryClient để kiểm soát và tương tác với cache của TanStack
    const queryClient = useQueryClient();

    // Duy trì tính nhất quán cho tham số tìm kiếm (tránh re-create object)
    const searchParams = React.useMemo(() => buildSearchParams(params), [params]);

    // Lấy ra số trang hiện tại từ search params
    const currentPage = searchParams.page ?? 0;

    // Đăng ký fetch data thông qua React Query (useQuery)
    const query = useQuery({
        // Dùng query keys động dựa trên bộ filters
        queryKey: productKeys.list(searchParams),

        // Gọi trực tiếp xuống Infrastructure Repository
        queryFn: () => ProductRepository.searchAndFilter(searchParams),

        // Chống hiện tượng Layout Shift trong lúc đổi trang
        placeholderData: keepPreviousData,

        // Gắn cấu hình cache tiêu chuẩn
        ...QUERY_CONFIG.STANDARD,
    });

    // Side Effect: Thực hiện tải trước (Prefetch) dữ liệu trang kế tiếp
    React.useEffect(() => {
        const totalPages = query.data?.totalPages ?? 1;

        // Nếu người dùng chưa ở trang cuối cùng, ta đoán già đoán non là họ sẽ click sang trang tiếp
        if (query.data && currentPage < totalPages - 1) {
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

    // Trả ra các field được "làm đẹp" lại cho UI dễ sử dụng
    return {
        products: query.data?.items ?? [],
        totalPages: query.data?.totalPages ?? 0,
        totalItems: query.data?.totalItems ?? 0,
        currentPage: query.data?.pageNumber ?? 0,
        isLoading: query.isLoading,
        isError: query.isError,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook `useProductDetail`: Lấy thông tin chi tiết của một sản phẩm duy nhất.
 * 
 * @param productId ID của sản phẩm cần lấy thông tin
 */
export function useProductDetail(productId: string | number | undefined) {
    const query = useQuery({
        queryKey: productKeys.detail(productId ?? ""),
        queryFn: () => ProductRepository.getById(productId!),
        // Chỉ kích hoạt query khi productId hợp lệ
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
