"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import type { ProductSearchParams } from "@/domain/product/repositories/product.repository.interface";
import { ProductRepository } from "@/infrastructure/repositories/product/product.repository";
import { REQUEST_CONFIG } from "@/shared/constants";
import { QUERY_CONFIG } from "@/shared/constants/query.constants";
import { productKeys } from "@/src/shared/constants/query-keys";

export interface ProductListParams extends Partial<ProductSearchParams> {
  search?: string;
}

function normalizeProductParams(params: ProductListParams = {}): ProductSearchParams {
  return {
    page: params.page ?? 0,
    size: params.size ?? REQUEST_CONFIG.DEFAULT_PAGE_SIZE,
    sortBy: params.sortBy ?? "create_at",
    sortDirection: params.sortDirection ?? "DESC",
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    keyword: params.keyword ?? params.search,
    minRating: params.minRating,
    maxRating: params.maxRating,
    categoryId: params.categoryId,
    brandId: params.brandId,
  };
}

export function useProductListQuery(params: ProductListParams = {}) {
  const queryClient = useQueryClient();
  const searchParams = useMemo(() => normalizeProductParams(params), [params]);

  const query = useQuery({
    queryKey: productKeys.list(searchParams as Record<string, unknown>),
    queryFn: () => ProductRepository.searchAndFilter(searchParams),
    placeholderData: keepPreviousData,
    ...QUERY_CONFIG.STANDARD,
  });

  useEffect(() => {
    const currentPage = searchParams.page ?? 0;
    const totalPages = query.data?.totalPages ?? 0;

    if (query.data && currentPage < totalPages - 1) {
      const nextParams = { ...searchParams, page: currentPage + 1 };
      void queryClient.prefetchQuery({
        queryKey: productKeys.list(nextParams as Record<string, unknown>),
        queryFn: () => ProductRepository.searchAndFilter(nextParams),
        staleTime: QUERY_CONFIG.STANDARD.staleTime,
      });
    }
  }, [query.data, queryClient, searchParams]);

  return query;
}

export function useProductDetailQuery(productId: string | number | undefined) {
  return useQuery({
    queryKey: productKeys.detail(productId ?? ""),
    queryFn: () => ProductRepository.getById(productId!),
    enabled: Boolean(productId),
    ...QUERY_CONFIG.STANDARD,
  });
}
