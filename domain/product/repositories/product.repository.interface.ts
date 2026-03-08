import { FilterResponseEntity } from "../entities/filter.entity";
import { ProductEntity } from "../entities/product.entity";

import type { DomainPaginatedResponse } from "@/shared/types";

/**
 * Cấu trúc phản hồi phân trang chuẩn cho danh sách Sản phẩm.
 */
export type ProductPagingResponse = DomainPaginatedResponse<ProductEntity>;

/**
 * Phản hồi chi tiết khi thực hiện lọc sản phẩm, bao gồm thông tin metadata của bộ lọc.
 */
export type FilterProductResponse = DomainPaginatedResponse<FilterResponseEntity>;

/**
 * Các tham số dùng để tìm kiếm và lọc sản phẩm.
 */
export interface ProductSearchParams {
    /** Chỉ mục trang (thường bắt đầu từ 1) */
    page?: number;
    /** Số lượng sản phẩm trên một trang */
    size?: number;
    /** Tên trường dữ liệu dùng để sắp xếp */
    sortBy?: string;
    /** Hướng sắp xếp ('ASC' hoặc 'DESC') */
    sortDirection?: string;
    /** Giá thấp nhất trong khoảng lọc */
    minPrice?: number;
    /** Giá cao nhất trong khoảng lọc */
    maxPrice?: number;
    /** Từ khóa tìm kiếm theo tên/mô tả */
    keyword?: string;
    /** Điểm đánh giá thấp nhất trong bộ lọc */
    minRating?: number;
    /** Điểm đánh giá cao nhất trong bộ lọc */
    maxRating?: number;
    /** Lọc theo mã danh mục cụ thể */
    categoryId?: number;
    /** Lọc theo mã thương hiệu cụ thể */
    brandId?: number;
}

/**
 * Giao diện Repository (Contract) cho việc quản lý dữ liệu Sản phẩm.
 * Định nghĩa các phương thức tiêu chuẩn để truy xuất dữ liệu sản phẩm và lọc nâng cao.
 */
export interface IProductRepository {
    /** Lấy toàn bộ danh sách sản phẩm (không phân trang - dùng cẩn thận) */
    getAll(): Promise<ProductEntity[]>;

    /** 
     * Lấy thông tin chi tiết một sản phẩm theo ID.
     * @param id Chấp nhận cả chuỗi hoặc số tùy theo phản hồi từ API.
     */
    getById(id: number | string): Promise<ProductEntity>;

    /** 
     * Lấy danh sách sản phẩm phân trang cơ bản.
     */
    getPaged(page?: number, size?: number, sortBy?: string, sortDirection?: string): Promise<ProductPagingResponse>;

    /** 
     * Thực hiện tìm kiếm và lọc sản phẩm phức hợp.
     * Trả về kết quả kèm theo siêu dữ liệu lọc (bộ lọc động).
     */
    searchAndFilter(params: ProductSearchParams): Promise<FilterProductResponse>;
}
