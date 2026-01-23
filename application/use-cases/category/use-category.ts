import { useRepositories } from "@/shared/providers/repository.provider";

export const useCategory = () => {
    const { categoryRepository } = useRepositories();

    return {
        getAll: async () => categoryRepository.getAll(),
        getById: async (id: number) => categoryRepository.getById(id),
        getPaged: async (page?: number, size?: number, sortBy?: string, sortDirection?: string) =>
            categoryRepository.getPaged(page, size, sortBy, sortDirection),
    };
};
