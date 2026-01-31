import { z } from "zod";

import { FilterResponseEntitySchema } from "@/domain/product/entities/filter.entity";
import { ProductEntity, ProductEntitySchema } from "@/domain/product/entities/product.entity";
import type { IProductRepository, ProductPagingResponse, ProductSearchParams, FilterProductResponse } from "@/domain/product/repositories/product.repository.interface";
import { httpClient } from "@/infrastructure/http/client";

const BASE_URL = "/products";

const ProductPagingSchema = z.object({
  status: z.number(),
  page_number: z.number(),
  page_size: z.number(),
  count_items: z.number(),
  count_pages: z.number(),
  data: z.array(ProductEntitySchema),
  message: z.string(),
});

const FilterProductResponseSchema = z.object({
  status: z.number(),
  page_number: z.number(),
  page_size: z.number(),
  count_items: z.number(),
  count_pages: z.number(),
  data: z.array(FilterResponseEntitySchema),
  message: z.string(),
});

export const ProductRepository: IProductRepository = {
  getAll: async (): Promise<ProductEntity[]> => {
    const { data } = await httpClient.get(BASE_URL);
    return z.array(ProductEntitySchema).parse(data);
  },

  getById: async (id: number | string): Promise<ProductEntity> => {
    const { data } = await httpClient.get(`${BASE_URL}/${id}`);
    // API: { status: 200, data: ProductResponse, message: "..." }
    const responseSchema = z.object({ data: ProductEntitySchema });
    const parsed = responseSchema.parse(data);
    return parsed.data;
  },

  getPaged: async (page = 0, size = 10, sortBy = "id", sortDirection = "DESC"): Promise<ProductPagingResponse> => {
    const { data } = await httpClient.get(`${BASE_URL}/paged`, {
      params: { page, size, sortBy, sortDirection },
    });
    return ProductPagingSchema.parse(data);
  },

  searchAndFilter: async (params: ProductSearchParams): Promise<FilterProductResponse> => {
    // API: /api/products/search-filter
    const { data } = await httpClient.get(`${BASE_URL}/search-filter`, {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || "createdAt",
        sortDirection: params.sortDirection || "DESC",
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        keyword: params.keyword,
        minRating: params.minRating,
        maxRating: params.maxRating,
        categoryId: params.categoryId,
        brandId: params.brandId,
      },
    });
    return FilterProductResponseSchema.parse(data);
  },
};
