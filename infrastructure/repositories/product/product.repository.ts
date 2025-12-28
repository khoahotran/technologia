import type { CreateProductDto, UpdateProductDto } from "@/domain/product";
import type { ProductEntity } from "@/domain/product/entities/product.entity";
import { ProductEntitySchema } from "@/domain/product/entities/product.entity";
import type { IProductRepository } from "@/domain/product/repositories/product.repository.interface";
import { httpClient } from "@/infrastructure/http/client";

const BASE_URL = "/products";

export const ProductRepository: IProductRepository = {
  getAll: async (): Promise<ProductEntity[]> => {
    const { data } = await httpClient.get(BASE_URL);
    // Validate response with Zod
    return data.map((d: unknown) => ProductEntitySchema.parse(d));
  },

  getById: async (id: string): Promise<ProductEntity> => {
    const { data } = await httpClient.get(`${BASE_URL}/${id}`);
    return ProductEntitySchema.parse(data);
  },

  create: async (dto: CreateProductDto): Promise<ProductEntity> => {
    const { data } = await httpClient.post(BASE_URL, dto);
    return ProductEntitySchema.parse(data);
  },

  update: async (id: string, dto: UpdateProductDto): Promise<ProductEntity> => {
    const { data } = await httpClient.patch(`${BASE_URL}/${id}`, dto);
    return ProductEntitySchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${BASE_URL}/${id}`);
  },
};
