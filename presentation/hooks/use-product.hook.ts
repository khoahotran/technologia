import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "./use-auth.hook";

import { useProduct } from "@/application/use-cases/product";
import type { UpdateProductDto } from "@/domain/product";

export const useProductHook = () => {
  // const { token } = useAuth(); // Token is now handled by httpClient interceptor
  const productService = useProduct();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
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

  return { productsQuery, createProduct, updateProduct, deleteProduct };
};
