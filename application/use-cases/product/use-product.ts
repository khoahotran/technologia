import type { CreateProductDto, UpdateProductDto } from "@/domain/product";
import { useRepositories } from "@/shared/providers/repository.provider";

export const useProduct = () => {
  const { productRepository } = useRepositories();

  return {
    getAll: async () => productRepository.getAll(),
    getPaged: async (
      page: number,
      size: number,
      sortBy?: string,
      sortDirection?: string,
      name?: string,
      minPrice?: number,
      maxPrice?: number,
      minStar?: number
    ) => productRepository.getPaged(page, size, sortBy, sortDirection, name, minPrice, maxPrice, minStar),
    getById: async (id: string) => productRepository.getById(id),
    create: async (dto: CreateProductDto) => productRepository.create(dto),
    update: async (id: string, dto: UpdateProductDto) => productRepository.update(id, dto),
    remove: async (id: string) => productRepository.delete(id),
  };
};
