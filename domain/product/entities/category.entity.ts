import { z } from "zod";

/**
 * Thực thể Danh mục (Category Entity)
 * 
 * Đại diện cho một nhóm các sản phẩm có cùng tính chất (VD: Điện tử, Thời trang, Gia dụng...).
 */
export const CategoryEntitySchema = z.object({
    /** 
     * Mã định danh duy nhất của danh mục. 
     * Luôn được chuẩn hóa về kiểu số (number) để đảm bảo tính nhất quán khi xử lý.
     */
    categoryId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    /** Tên hiển thị của danh mục */
    name: z.string(),
});

/** Kiểu dữ liệu TypeScript suy diễn từ Schema */
export type CategoryEntity = z.infer<typeof CategoryEntitySchema>;
