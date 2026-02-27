import { useRepositories } from "@/shared/providers/repository.provider";

export const useCategory = () => {
    const { categoryRepository } = useRepositories();

    return {
        getAll: () => categoryRepository.getAll(),
        getById: (id: number) => categoryRepository.getById(id),
        getPaged: (page?: number, size?: number, sortBy?: string, sortDirection?: string) =>
            categoryRepository.getPaged(page, size, sortBy, sortDirection),
    };
};
