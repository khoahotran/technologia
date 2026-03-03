import { useRepositories } from "@/shared/providers/repository.provider";

/**
 * Hook Use-Case cung cấp các thao tác liên quan đến Category (Danh mục sản phẩm).
 * Tương tự useBrand, nó kết nối Presentation Layer với CategoryRepository thông qua Provider.
 */
export const useCategory = () => {
    // Lấy instance repository từ context chung của ứng dụng
    const { categoryRepository } = useRepositories();

    return {
        /** Lấy toàn bộ phân cấp danh mục phục vụ Menu/Sidebar */
        getAll: () => categoryRepository.getAll(),

        /** Lấy chi tiết một danh mục cụ thể */
        getById: (id: number) => categoryRepository.getById(id),

        /** 
         * Lấy danh mục có phân trang 
         * @param page Số trang
         * @param size Kích thước trang
         * @param sortBy Sắp xếp theo trường
         * @param sortDirection Hướng sắp xếp
         */
        getPaged: (page?: number, size?: number, sortBy?: string, sortDirection?: string) =>
            categoryRepository.getPaged(page, size, sortBy, sortDirection),
    };
};
