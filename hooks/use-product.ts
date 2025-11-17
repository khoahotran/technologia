import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreateProductDto,
  PaginatedProductsParams,
  ProductEntity,
  UpdateProductDto,
} from "../config/product.config";
import {
  createProductApi,
  duplicateProductApi,
  getProductByIdApi,
  getProductLinkApi,
  getProductQuestIdsApi,
  getProductsByAreaApi,
  getProductsByStoreApi,
  importProductsFromCsvApi,
  updateContentHubsForStoreApi,
  updateProductApi,
} from "./product.api";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
 
};

export const useGetProductById = (
  productId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductByIdApi(productId),
    enabled: options?.enabled ?? Boolean(productId),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


export const useGetProductLink = (productId: string) => {
  return useQuery({
    queryKey: [...productKeys.detail(productId), "link"],
    queryFn: () => getProductLinkApi(productId),
    enabled: false, // Only fetch when manually triggered
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      productData,
    }: {
      storeId: string;
      productData: CreateProductDto;
    }) => createProductApi(storeId, productData),
    onSuccess: (data: ProductEntity, variables) => {
      // Invalidate all queries for this store (including paginated ones)
      queryClient.invalidateQueries({
        queryKey: productKeys.byStore(variables.storeId),
      });
      // Invalidate area products if coordinates match
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Set individual product data
      queryClient.setQueryData(productKeys.detail(data.id), data);
    },
    onError: (error) => {
      console.error("Failed to create product:", error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      productData,
    }: {
      productId: string;
      productData: UpdateProductDto;
    }) => updateProductApi(productId, productData),
    onSuccess: (_, variables) => {
      // Invalidate all product queries since we don't know which store this belongs to
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      console.error("Failed to update product:", error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => {
      // Note: You'll need to implement deleteProductApi if it doesn't exist
      // For now, this is a placeholder that throws an error
      throw new Error("Delete product API not implemented");
    },
    onSuccess: (_, productId) => {
      // Invalidate all product lists since we don't know which store this belongs to
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Remove specific product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
    },
    onError: (error) => {
      console.error("Failed to delete product:", error);
    },
  });
};
