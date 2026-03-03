import { BrandEntity } from "../entities/brand.entity";

/**
 * Cấu trúc phản hồi phân trang chuẩn cho danh sách Thương hiệu.
 */
export interface BrandPagingResponse {
    /** Mã trạng thái HTTP hoặc mã nội bộ từ backend */
    status: number;
    /** Số thứ tự trang hiện tại (thường bắt đầu từ 0 hoặc 1 tùy API) */
    page_number: number;
    /** Số lượng phần tử tối đa trên mỗi trang */
    page_size: number;
    /** Tổng số lượng thương hiệu khớp với bộ lọc trong cơ sở dữ liệu */
    count_items: number;
    /** Tổng số lượng trang khả dụng dựa trên page_size */
    count_pages: number;
    /** Danh sách thực thể Thương hiệu cho trang hiện tại */
    data: BrandEntity[];
    /** Thông báo từ hệ thống */
    message: string;
}

/**
 * Giao diện Repository (Contract) cho việc quản lý dữ liệu Thương hiệu.
 * Định nghĩa các phương thức tiêu chuẩn để truy xuất dữ liệu từ lớp Infrastructure.
 */
export interface IBrandRepository {
    /** Lấy toàn bộ danh sách thương hiệu có trong hệ thống (không phân trang) */
    getAll(): Promise<BrandEntity[]>;

    /** Lấy thông tin chi tiết một thương hiệu dựa trên mã số ID */
    getById(id: number): Promise<BrandEntity>;

    /** 
     * Lấy danh sách thương hiệu có hỗ trợ phân trang và sắp xếp.
     * @param page Chỉ mục trang cần lấy.
     * @param size Số lượng item trên một trang.
     * @param sortBy Tên trường dữ liệu dùng để sắp xếp.
     * @param sortDirection Hướng sắp xếp ('ASC' hoặc 'DESC').
     */
    getPaged(page?: number, size?: number, sortBy?: string, sortDirection?: string): Promise<BrandPagingResponse>;
}
