import type { CreateProductDto, UpdateProductDto } from "@/domain/product";
import type { ProductEntity } from "@/domain/product/entities/product.entity";
import { ProductRepository } from "@/infrastructure/repositories/product";

export const useProduct = () => {
  return {
    getAll: async () => ProductRepository.getAll(),
    getById: async (id: string) => ProductRepository.getById(id),
    create: async (dto: CreateProductDto) => ProductRepository.create(dto),
    update: async (id: string, dto: UpdateProductDto) => ProductRepository.update(id, dto),
    remove: async (id: string) => ProductRepository.delete(id),
  };
};
