import { useRepositories } from "@/shared/providers/repository.provider";

/**
 * Hook Use-Case cung cấp các thao tác liên quan đến Brand (Thương hiệu).
 * Sử dụng RepositoryProvider để lấy cụm BrandRepository đã được khởi tạo (cho phép dễ dàng Mocking/Testing).
 */
export const useBrand = () => {
    // Trích xuất repository từ context shared
    const { brandRepository } = useRepositories();

    return {
        /** Lấy toàn bộ danh sách thương hiệu không phân trang */
        getAll: () => brandRepository.getAll(),

        /** Tìm kiếm thương hiệu cụ thể theo ID */
        getById: (id: number) => brandRepository.getById(id),

        /** 
         * Lấy danh sách thương hiệu có phân trang và sắp xếp 
         * @param page Số trang hiện tại
         * @param size Số lượng item mỗi trang
         * @param sortBy Trường cần sắp xếp
         * @param sortDirection Hướng sắp xếp (ASC/DESC)
         */
        getPaged: (page?: number, size?: number, sortBy?: string, sortDirection?: string) =>
            brandRepository.getPaged(page, size, sortBy, sortDirection),
    };
};
