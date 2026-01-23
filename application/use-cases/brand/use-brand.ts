import { useRepositories } from "@/shared/providers/repository.provider";

export const useBrand = () => {
    const { brandRepository } = useRepositories();

    return {
        getAll: async () => brandRepository.getAll(),
        getById: async (id: number) => brandRepository.getById(id),
        getPaged: async (page?: number, size?: number, sortBy?: string, sortDirection?: string) =>
            brandRepository.getPaged(page, size, sortBy, sortDirection),
    };
};
