import { z } from "zod";

import { CategoryEntity, CategoryEntitySchema } from "@/domain/product/entities/category.entity";
import { ICategoryRepository, CategoryPagingResponse } from "@/domain/product/repositories/category.repository.interface";
import { httpClient } from "@/infrastructure/http/client";


const BASE_URL = "/categories";

const CategoryPagingSchema = z.object({
    status: z.number(),
    page_number: z.number(),
    page_size: z.number(),
    count_items: z.number(),
    count_pages: z.number(),
    data: z.array(CategoryEntitySchema),
    message: z.string(),
});

export const CategoryRepository: ICategoryRepository = {
    getAll: async (): Promise<CategoryEntity[]> => {
        const { data } = await httpClient.get(BASE_URL);
        return z.array(CategoryEntitySchema).parse(data);
    },

    getById: async (id: number): Promise<CategoryEntity> => {
        const { data } = await httpClient.get(`${BASE_URL}/${id}`);
        const responseSchema = z.object({ data: CategoryEntitySchema });
        const parsed = responseSchema.parse(data);
        return parsed.data;
    },

    getPaged: async (page = 0, size = 10, sortBy = "id", sortDirection = "DESC"): Promise<CategoryPagingResponse> => {
        const { data } = await httpClient.get(`${BASE_URL}/paged`, {
            params: { page, size, sortBy, sortDirection },
        });
        return CategoryPagingSchema.parse(data);
    },
};
