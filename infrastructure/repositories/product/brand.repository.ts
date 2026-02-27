import { BrandEntity, BrandEntitySchema } from "@/domain/product/entities/brand.entity";
import { BrandPagingResponse, IBrandRepository } from "@/domain/product/repositories/brand.repository.interface";
import {
    createBaseRepository,
    normalizePagingParams,
} from "@/infrastructure/repositories/base.repository";

const BASE_PATH = "/brands";

const baseRepository = createBaseRepository<BrandEntity>({
    basePath: BASE_PATH,
    entitySchema: BrandEntitySchema,
});

export const BrandRepository: IBrandRepository = {
    getAll: baseRepository.getAll,
    getById: baseRepository.getById,
    getPaged: async (page = 0, size = 10, sortBy = "id", sortDirection = "DESC") => {
        const paging = normalizePagingParams({
            page,
            size,
            sortBy,
            sortDirection: sortDirection as "ASC" | "DESC",
        });
        return baseRepository.getPaged(paging) as Promise<BrandPagingResponse>;
    },
};
