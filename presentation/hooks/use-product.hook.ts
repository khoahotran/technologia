import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { useAuth } from "./use-auth.hook";

import { useProduct } from "@/application/use-cases/product";
import type { UpdateProductDto } from "@/domain/product";

interface UseProductParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  minStar?: number;
  maxStar?: number;
}

export const useProductHook = (params?: UseProductParams) => {
  // const { token } = useAuth(); // Token is now handled by httpClient interceptor
  const productService = useProduct();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  const pagedProductsQuery = useQuery({
    queryKey: [
      "products",
      "paged",
      params?.page,
      params?.size,
      params?.sortBy,
      params?.sortDirection,
      params?.name,
      params?.minPrice,
      params?.maxPrice,
      params?.minStar,
      params?.maxStar
    ],
    queryFn: () => productService.getPaged(
      params?.page ?? 0,
      params?.size ?? 12,
      params?.sortBy,
      params?.sortDirection,
      params?.name,
      params?.minPrice,
      params?.maxPrice,
      params?.minStar,
      params?.maxStar
    ),
    placeholderData: keepPreviousData,
    enabled: !!params, // Only run if params might be intended or always run?
    // Actually, if I want to use it in ProductList, I will pass params.
    // If I use it in TopProducts without params, this query might run with defaults? 
    // Defaults are page=0, size=12.
  });

  const createProduct = useMutation({
    mutationFn: productService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      productService.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const deleteProduct = useMutation({
    mutationFn: productService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  return { productsQuery, pagedProductsQuery, createProduct, updateProduct, deleteProduct };
};
