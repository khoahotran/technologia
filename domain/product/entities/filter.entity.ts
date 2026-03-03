import { z } from "zod";

import { ProductVariantSchema } from "./product.entity";

/**
 * Thực thể Phản hồi Tìm kiếm/Lọc (Filter Response Entity)
 * 
 * Đại diện cho cấu trúc dữ liệu trả về từ API Tìm kiếm và Lọc sản phẩm.
 * Cấu trúc này kết hợp thông tin sản phẩm đầy đủ kèm theo các siêu dữ liệu (metadata) về bộ lọc hiện tại.
 */
export const FilterResponseEntitySchema = z.object({
    /** Mã định danh sản phẩm, được chuẩn hóa về kiểu chuỗi (string) */
    productId: z.union([z.string(), z.number()]).transform(String),
    /** Tên sản phẩm */
    name: z.string(),
    /** Mô tả chi tiết sản phẩm (tùy chọn) */
    description: z.string().optional(),
    /** Giá hiển thị chính, được chuyển đổi an toàn sang kiểu số */
    displayPrice: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
    /** Tổng số lượng tồn kho của tất cả biến thể */
    totalStock: z.number().optional(),
    /** Trạng thái hoạt động (VD: ACTIVE, INACTIVE) */
    status: z.string(),
    /** Danh sách các biến thể có sẵn của sản phẩm */
    variants: z.array(ProductVariantSchema).optional(),
    /** Thông số kỹ thuật dưới dạng văn bản thô */
    specsText: z.string().optional(),
    /** Tên thương hiệu đi kèm */
    brand: z.string().optional(),
    /** Tên danh mục đi kèm */
    category: z.string().optional(),
    /** Điểm đánh giá trung bình từ người dùng */
    averageRating: z.number().optional(),

    // --- Thông tin Meta của Bộ lọc hiện tại ---
    /** Giá thấp nhất trong phạm vi lọc */
    minPrice: z.number().nullable().optional(),
    /** Giá cao nhất trong phạm vi lọc */
    maxPrice: z.number().nullable().optional(),
    /** Điểm đánh giá thấp nhất trong bộ lọc */
    minRating: z.number().nullable().optional(),
    /** Điểm đánh giá cao nhất trong bộ lọc */
    maxRating: z.number().nullable().optional(),
    /** Tên cột đang được dùng để sắp xếp */
    sortBy: z.string().nullable().optional(),
    /** Hướng sắp xếp (ASC/DESC hoặc ASCENDING/DESCENDING) */
    sortOrder: z.string().nullable().optional(),
});

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type FilterResponseEntity = z.infer<typeof FilterResponseEntitySchema>;
