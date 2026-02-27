import { CategoryEntity, CategoryEntitySchema } from "@/domain/product/entities/category.entity";
import { CategoryPagingResponse, ICategoryRepository } from "@/domain/product/repositories/category.repository.interface";
import {
    createBaseRepository,
    normalizePagingParams,
} from "@/infrastructure/repositories/base.repository";

const BASE_PATH = "/categories";

const baseRepository = createBaseRepository<CategoryEntity>({
    basePath: BASE_PATH,
    entitySchema: CategoryEntitySchema,
});

export const CategoryRepository: ICategoryRepository = {
    getAll: baseRepository.getAll,
    getById: baseRepository.getById,
    getPaged: async (page = 0, size = 10, sortBy = "id", sortDirection = "DESC") => {
        const paging = normalizePagingParams({
            page,
            size,
            sortBy,
            sortDirection: sortDirection as "ASC" | "DESC",
        });
        return baseRepository.getPaged(paging) as Promise<CategoryPagingResponse>;
    },
};
