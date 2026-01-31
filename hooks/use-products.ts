import { useQuery } from "@tanstack/react-query";

import type { ProductSearchParams } from "@/domain/product/repositories/product.repository.interface";
import { ProductRepository } from "@/infrastructure/repositories/product/product.repository";

export const PRODUCT_KEYS = {
    all: ["products"] as const,
    paged: (page: number, size: number, sortBy: string, sortDirection: string) =>
        [...PRODUCT_KEYS.all, "paged", { page, size, sortBy, sortDirection }] as const,
    search: (params: ProductSearchParams) =>
        [...PRODUCT_KEYS.all, "search", params] as const,
    detail: (id: string | number) => [...PRODUCT_KEYS.all, "detail", id] as const,
};

export const useProducts = () => {
    const usePagedProducts = (
        page = 0,
        size = 10,
        sortBy = "id",
        sortDirection = "DESC"
    ) => {
        return useQuery({
            queryKey: PRODUCT_KEYS.paged(page, size, sortBy, sortDirection),
            queryFn: () => ProductRepository.getPaged(page, size, sortBy, sortDirection),
        });
    };

    const useSearchProducts = (params: ProductSearchParams) => {
        return useQuery({
            queryKey: PRODUCT_KEYS.search(params),
            queryFn: () => ProductRepository.searchAndFilter(params),
        });
    };

    const useProductDetail = (id: string | number) => {
        return useQuery({
            queryKey: PRODUCT_KEYS.detail(id),
            queryFn: () => ProductRepository.getById(id),
            enabled: !!id,
        });
    };

    return {
        usePagedProducts,
        useSearchProducts,
        useProductDetail,
    };
};
