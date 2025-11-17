import { ProductRepository } from "@/infrastructure/product/repositories/product.repository";
import { CreateProductDto, UpdateProductDto } from "@/domain/product/dto";
import { ProductEntity } from "@/domain/product/entities/product.entity";

export const useProduct = () => {
  const getAll = async (): Promise<ProductEntity[]> => {
    return ProductRepository.getAll();
  };

  const getById = async (id: string): Promise<ProductEntity> => {
    return ProductRepository.getById(id);
  };

  const create = async (dto: CreateProductDto): Promise<ProductEntity> => {
    return ProductRepository.create(dto);
  };

  const update = async (id: string, dto: UpdateProductDto): Promise<ProductEntity> => {
    return ProductRepository.update(id, dto);
  };

  const remove = async (id: string): Promise<void> => {
    return ProductRepository.delete(id);
  };

  return { getAll, getById, create, update, remove };
};
