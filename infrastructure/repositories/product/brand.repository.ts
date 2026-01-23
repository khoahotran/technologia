import { httpClient } from "@/infrastructure/http/client";
import { IBrandRepository, BrandPagingResponse } from "@/domain/product/repositories/brand.repository.interface";
import { BrandEntity, BrandEntitySchema } from "@/domain/product/entities/brand.entity";
import { z } from "zod";

const BASE_URL = "/brands";

const BrandPagingSchema = z.object({
    status: z.number(),
    page_number: z.number(),
    page_size: z.number(),
    count_items: z.number(),
    count_pages: z.number(),
    data: z.array(BrandEntitySchema),
    message: z.string(),
});

export const BrandRepository: IBrandRepository = {
    getAll: async (): Promise<BrandEntity[]> => {
        const { data } = await httpClient.get(BASE_URL);
        // API: http://localhost:8082/api/brands -> List<BrandResponse>
        return z.array(BrandEntitySchema).parse(data);
    },

    getById: async (id: number): Promise<BrandEntity> => {
        const { data } = await httpClient.get(`${BASE_URL}/${id}`);
        // API: { status: 200, data: { brandId: 1, name: "Anker" }, message: "..." }
        // We assume axios returns the whole response body in `data`
        // We need to parse data.data
        const responseSchema = z.object({ data: BrandEntitySchema });
        const parsed = responseSchema.parse(data);
        return parsed.data;
    },

    getPaged: async (page = 0, size = 10, sortBy = "id", sortDirection = "DESC"): Promise<BrandPagingResponse> => {
        const { data } = await httpClient.get(`${BASE_URL}/paged`, {
            params: { page, size, sortBy, sortDirection },
        });
        return BrandPagingSchema.parse(data);
    },
};
