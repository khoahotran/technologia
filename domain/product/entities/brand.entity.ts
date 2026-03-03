import { z } from "zod";

/**
 * Thực thể Thương hiệu (Brand Entity)
 * 
 * Đại diện cho một nhãn hiệu sản phẩm trong hệ thống (VD: Apple, Samsung, Nike...).
 */
export const BrandEntitySchema = z.object({
    /** 
     * Mã định danh duy nhất của thương hiệu. 
     * Sử dụng transformer để đảm bảo luôn ở định dạng số (number) trong logic nghiệp vụ.
     */
    brandId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    /** Tên hiển thị của thương hiệu */
    name: z.string(),
});

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type BrandEntity = z.infer<typeof BrandEntitySchema>;
