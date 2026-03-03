import { z } from "zod";


import { BaseEntitySchema } from "@/domain/entities/base.entity";

/**
 * Bản phác thảo Biến thể Sản phẩm (Product Variant Schema)
 * 
 * Định nghĩa các biến thể cụ thể của một sản phẩm (VD: iPhone 13 màu Đỏ, bản 128GB).
 */
export const ProductVariantSchema = z.object({
    /** Mã định danh duy nhất của biến thể */
    variantId: z.string().optional(),
    /** Đặc tả màu sắc */
    color: z.string().optional(),
    /** Đặc tả dung lượng bộ nhớ */
    storage: z.string().optional(),
    /** Số lượng hàng còn lại trong kho của biến thể này */
    stock: z.number(),
    /** Giá bán của biến thể này */
    price: z.number(),
    /** Danh sách các URL hình ảnh đại diện cho biến thể */
    images: z.array(z.string()),
});

/**
 * Thực thể Sản phẩm Chính (Product Entity)
 * 
 * Kế thừa từ BaseEntitySchema để bao gồm các trường thời gian (createdAt, updatedAt).
 * Đây là thực thể trung tâm đại diện cho một sản phẩm trong hệ thống.
 */
export const ProductEntitySchema = BaseEntitySchema.extend({
    /** 
     * Mã sản phẩm. Backend có thể trả về string (UUID) hoặc number, 
     * nên chúng ta chuẩn hóa về kiểu string để dễ quản lý ở Frontend.
     */
    productId: z.union([z.string(), z.number()]).transform(String),
    /** Tên sản phẩm */
    name: z.string(),
    /** Mô tả sản phẩm (có thể chứa mã HTML) */
    description: z.string().optional(),
    /** Tổng số lượng tồn kho (tổng hợp từ tất cả biến thể) */
    totalStock: z.number().optional(),
    /** Điểm đánh giá trung bình (VD: 4.5 sao) */
    averageRating: z.number().optional(),
    /** 
     * Giá hiển thị chính thức ra giao diện.
     * Xử lý chuyển đổi an toàn từ chuỗi sang số nếu backend trả về sai định dạng.
     */
    displayPrice: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
    /** Trạng thái nghiệp vụ (VD: 'active', 'inactive', 'out_of_stock') */
    status: z.string(),
    /** Danh sách các biến thể đi kèm */
    variants: z.array(ProductVariantSchema).optional(),
    /** Thông số kỹ thuật chi tiết dưới dạng văn bản thô */
    specsText: z.string().optional(),
    /** Tên thương hiệu */
    brand: z.string().optional(),
    /** Tên thương hiệu (trường cũ, dùng cho tương thích ngược) */
    brandName: z.string().optional(),
    /** Tên danh mục sản phẩm */
    category: z.string().optional(),
});

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type ProductEntity = z.infer<typeof ProductEntitySchema>;
