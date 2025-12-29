import type { CreateProductDto, UpdateProductDto } from "@/domain/product";
import type { ProductEntity } from "@/domain/product/entities/product.entity";
import { ProductEntitySchema } from "@/domain/product/entities/product.entity";
import type { IProductRepository } from "@/domain/product/repositories/product.repository.interface";
import { httpClient } from "@/infrastructure/http/client";

const BASE_URL = "/products";

export const ProductRepository: IProductRepository = {
  getAll: async (): Promise<ProductEntity[]> => {
    // Determine if we should use paged or all based on requirement. 
    // For now, default getAll fetches the list endpoint.
    const { data } = await httpClient.get(BASE_URL);
    return data.map((d: unknown) => ProductEntitySchema.parse(d));
  },

  getById: async (id: string): Promise<ProductEntity> => {
    const { data } = await httpClient.get(`${BASE_URL}/${id}`);
    // Backend wraps response in { status: 200, data: {...}, message } as per Postman for getById
    return ProductEntitySchema.parse(data.data);
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

  // Extended for Pagination
  getPaged: async (
    page = 0,
    size = 10,
    sortBy = "price",
    sortDirection = "ASC",
    name,
    minPrice,
    maxPrice,
    minStar
  ): Promise<{ data: ProductEntity[], total: number }> => {
    const { data } = await httpClient.get(`${BASE_URL}/paged`, {
      params: {
        page,
        size,
        sortBy,
        sortDirection,
        name,
        minPrice,
        maxPrice,
        minStar
      }
    });

    return {
      data: data.data.map((d: unknown) => ProductEntitySchema.parse(d)),
      total: data.count_items
    };
  }
};
