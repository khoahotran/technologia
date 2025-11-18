import { CreateProductDto, UpdateProductDto } from "@/domain/product";
import { ProductEntity, ProductEntitySchema } from "@/domain/product/entities/product.entity";
import { fetchWithAuth } from "@/lib/fetch-auth";
import { handleResponse } from "@/lib/handle-response";

const BASE_URL = "/api/products"; // hoặc từ config

export const ProductRepository = {
  getAll: async (): Promise<ProductEntity[]> => {
    const res = await fetchWithAuth(BASE_URL);
    const data = await handleResponse<ProductEntity[]>(res);
    return data.map(d => ProductEntitySchema.parse(d));
  },

  getById: async (id: string): Promise<ProductEntity> => {
    const res = await fetchWithAuth(`${BASE_URL}/${id}`);
    const data = await handleResponse<ProductEntity>(res);
    return ProductEntitySchema.parse(data);
  },

  create: async (dto: CreateProductDto): Promise<ProductEntity> => {
    const res = await fetchWithAuth(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await handleResponse<ProductEntity>(res);
    return ProductEntitySchema.parse(data);
  },

  update: async (id: string, dto: UpdateProductDto): Promise<ProductEntity> => {
    const res = await fetchWithAuth(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await handleResponse<ProductEntity>(res);
    return ProductEntitySchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetchWithAuth(`${BASE_URL}/${id}`, { method: "DELETE" });
    await handleResponse<void>(res);
  },
};
