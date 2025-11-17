import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProduct } from "@/application/use-cases/useProduct";
import { CreateProductDto, UpdateProductDto } from "@/domain/product/dto";

export const useProductHook = () => {
  const productService = useProduct();
  const queryClient = useQueryClient();

  const productsQuery = useQuery(["products"], productService.getAll);

  const createProduct = useMutation(productService.create, {
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  const updateProduct = useMutation(({ id, dto }: { id: string; dto: UpdateProductDto }) =>
    productService.update(id, dto),
  {
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  const deleteProduct = useMutation(productService.remove, {
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  return { productsQuery, createProduct, updateProduct, deleteProduct };
};
