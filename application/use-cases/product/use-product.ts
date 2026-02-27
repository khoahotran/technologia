import type { ProductSearchParams } from "@/domain/product/repositories/product.repository.interface";
import { useRepositories } from "@/shared/providers/repository.provider";

export const useProduct = () => {
  const { productRepository } = useRepositories();

  return {
    getAll: () => productRepository.getAll(),
    getPaged: (
      page: number,
      size: number,
      sortBy?: string,
      sortDirection?: string
    ) => productRepository.getPaged(page, size, sortBy, sortDirection),

    searchAndFilter: (params: ProductSearchParams) => productRepository.searchAndFilter(params),

    getById: (id: string | number) => productRepository.getById(id),
  };
};
