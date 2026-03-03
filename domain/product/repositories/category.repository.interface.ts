import { CategoryEntity } from "../entities/category.entity";

/**
 * Cấu trúc phản hồi phân trang chuẩn cho danh sách Danh mục.
 */
export interface CategoryPagingResponse {
    /** Mã trạng thái HTTP hoặc mã nội bộ từ backend */
    status: number;
    /** Số thứ tự trang hiện tại */
    page_number: number;
    /** Số lượng phần tử tối đa trên mỗi trang */
    page_size: number;
    /** Tổng số lượng danh mục khớp với bộ lọc trong cơ sở dữ liệu */
    count_items: number;
    /** Tổng số lượng trang khả dụng dựa trên page_size */
    count_pages: number;
    /** Danh sách thực thể Danh mục cho trang hiện tại */
    data: CategoryEntity[];
    /** Thông báo từ hệ thống */
    message: string;
}

/**
 * Giao diện Repository (Contract) cho việc quản lý dữ liệu Danh mục.
 * Giúp tách biệt logic nghiệp vụ khỏi việc truy xuất dữ liệu cụ thể.
 */
export interface ICategoryRepository {
    /** Lấy danh sách toàn bộ các danh mục có sẵn trong hệ thống */
    getAll(): Promise<CategoryEntity[]>;

    /** Lấy thông tin chi tiết một danh mục dựa trên ID */
    getById(id: number): Promise<CategoryEntity>;

    /** 
     * Lấy danh sách danh mục có hỗ trợ phân trang và sắp xếp.
     * @param page Chỉ mục trang cần lấy.
     * @param size Số lượng item trên một trang.
     * @param sortBy Tên trường dữ liệu dùng để sắp xếp.
     * @param sortDirection Hướng sắp xếp ('ASC' hoặc 'DESC').
     */
    getPaged(page?: number, size?: number, sortBy?: string, sortDirection?: string): Promise<CategoryPagingResponse>;
}
