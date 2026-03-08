"use client";

import type { ProductSearchParams } from "@/domain/product/repositories/product.repository.interface";
import {
  useProductDetailQuery,
  useProductListQuery,
  type ProductListParams,
} from "@/src/presentation/hooks/use-product-catalog";
import { queryKeys } from "@/src/shared/constants/query-keys";

export const productKeys = {
  all: queryKeys.products.all,
  lists: queryKeys.products.lists,
  list: (params: ProductSearchParams) => queryKeys.products.list(params as Record<string, unknown>),
  details: () => [...queryKeys.products.all, "detail"] as const,
  detail: queryKeys.products.detail,
  search: (query: string) => [...queryKeys.products.all, "search", query] as const,
  brands: () => [...queryKeys.products.all, "brands"] as const,
  categories: () => [...queryKeys.products.all, "categories"] as const,
};

export type { ProductListParams };

export function useProductList(params: ProductListParams = {}) {
  const query = useProductListQuery(params);

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

export function useProductDetail(productId: string | number | undefined) {
  const query = useProductDetailQuery(productId);

  return {
    product: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
