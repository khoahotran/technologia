import type { ProductSearchParams } from "@/domain/product/repositories/product.repository.interface";
import { useRepositories } from "@/shared/providers/repository.provider";

/**
 * Hook Use-Case tập hợp các thao tác nghiệp vụ liên quan đến Sản phẩm.
 * Hoạt động như một cổng giao tiếp (Facade) giữa UI và ProductRepository.
 */
export const useProduct = () => {
  // Trích xuất repository từ tầng Infrastructure (thông qua DI Provider)
  const { productRepository } = useRepositories();

  return {
    /** Lấy tất cả sản phẩm (thường dùng cho các danh mục nhỏ hoặc cache) */
    getAll: () => productRepository.getAll(),

    /** 
     * Lấy sản phẩm có phân trang cơ bản 
     * @param page Chỉ mục trang
     * @param size Số sản phẩm mỗi trang
     * @param sortBy Sắp xếp theo trường dữ liệu nào
     * @param sortDirection Chiều sắp xếp (ASC tăng dần/ DESC giảm dần)
     */
    getPaged: (
      page: number,
      size: number,
      sortBy?: string,
      sortDirection?: string
    ) => productRepository.getPaged(page, size, sortBy, sortDirection),

    /** 
     * Tìm kiếm nâng cao kết hợp bộ lọc (Brand, Category, Giá, Query văn bản)
     * Đây là method chính cho trang danh sách sản phẩm.
     * @param params Object chứa tất cả các tham số lọc và tìm kiếm cần thiết
     */
    searchAndFilter: (params: ProductSearchParams) => productRepository.searchAndFilter(params),

    /** 
     * Tìm chi tiết một sản phẩm cụ thể theo ID hoặc Slug 
     * @param id ID của sản phẩm
     */
    getById: (id: string | number) => productRepository.getById(id),
  };
};
