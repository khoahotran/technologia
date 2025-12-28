import type { CreateProductDto, UpdateProductDto } from "@/domain/product";
import { useRepositories } from "@/shared/providers/repository.provider";

export const useProduct = () => {
  const { productRepository } = useRepositories();

  return {
    getAll: async () => productRepository.getAll(),
    getById: async (id: string) => productRepository.getById(id),
    create: async (dto: CreateProductDto) => productRepository.create(dto),
    update: async (id: string, dto: UpdateProductDto) => productRepository.update(id, dto),
    remove: async (id: string) => productRepository.delete(id),
  };
};
