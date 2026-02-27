import { useRepositories } from "@/shared/providers/repository.provider";

export const useBrand = () => {
    const { brandRepository } = useRepositories();

    return {
        getAll: () => brandRepository.getAll(),
        getById: (id: number) => brandRepository.getById(id),
        getPaged: (page?: number, size?: number, sortBy?: string, sortDirection?: string) =>
            brandRepository.getPaged(page, size, sortBy, sortDirection),
    };
};
