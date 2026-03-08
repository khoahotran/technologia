import { BrandEntity } from "../entities/brand.entity";

import type { DomainPaginatedResponse } from "@/shared/types";

/**
 * Cấu trúc phản hồi phân trang chuẩn cho danh sách Thương hiệu.
 */
export type BrandPagingResponse = DomainPaginatedResponse<BrandEntity>;

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
