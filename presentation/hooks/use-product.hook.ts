import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { useProduct } from "@/application/use-cases/product";
import type { ProductSearchParams } from "@/domain/product/repositories/product.repository.interface";

type UseProductHookParams = {
  [K in keyof ProductSearchParams]?: ProductSearchParams[K] | undefined;
};

export const useProductHook = (params?: UseProductHookParams) => {
  const productService = useProduct();

  // Search & Filter Query
  const pagedProductsQuery = useQuery({
    queryKey: [
      "products",
      "paged",
      params?.page,
      params?.size,
      params?.sortBy,
      params?.sortDirection,
      params?.keyword,
      params?.minPrice,
      params?.maxPrice,
      params?.minRating,
      params?.maxRating,
      params?.categoryId,
      params?.brandId
    ],
    queryFn: () => {
      const searchParams: ProductSearchParams = {
        page: params?.page ?? 0,
        size: params?.size ?? 12,
        sortBy: params?.sortBy || "createdAt",
        sortDirection: params?.sortDirection || "DESC",
      };
      if (params?.keyword) searchParams.keyword = params.keyword;
      if (params?.minPrice !== undefined) searchParams.minPrice = params.minPrice;
      if (params?.maxPrice !== undefined) searchParams.maxPrice = params.maxPrice;
      if (params?.minRating !== undefined) searchParams.minRating = params.minRating;
      if (params?.maxRating !== undefined) searchParams.maxRating = params.maxRating;
      if (params?.categoryId !== undefined) searchParams.categoryId = params.categoryId;
      if (params?.brandId !== undefined) searchParams.brandId = params.brandId;

      return productService.searchAndFilter(searchParams);
    },
    placeholderData: keepPreviousData,
    enabled: !!params,
  });

  // Removed mutations as they are not part of current requirement and caused errors

  return { pagedProductsQuery };
};
