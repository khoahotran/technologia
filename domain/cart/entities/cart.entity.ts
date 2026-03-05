import { z } from "zod";

/**
 * Bản phác thảo Mục Giỏ hàng (Cart Item Schema)
 * 
 * Xác thực các thuộc tính cốt lõi của một sản phẩm nằm trong giỏ hàng.
 * Dữ liệu này thường được trả về từ Cart Service (Port 8083).
 */
export const CartItemSchema = z.object({
    /** Mã định danh duy nhất cho bản ghi mục giỏ hàng */
    cartItemId: z.string(),
    /** Mã định danh sản phẩm toàn cầu */
    productId: z.string(),
    /** Mã định danh biến thể sản phẩm (màu sắc, kích thước...) */
    variantId: z.string().optional(),
    /** Thời điểm mục này được thêm vào giỏ (ISO Timestamp) */
    addAt: z.string().optional(),
    /** Thời điểm cập nhật mục này lần cuối (ISO Timestamp) */
    updateAt: z.string().optional(),
    /** Số lượng sản phẩm người dùng đã chọn */
    currentQuantity: z.number(),
    /** Tên hiển thị của sản phẩm */
    name: z.string(),
    /** Đặc tả màu sắc (nếu có) */
    color: z.string().optional(),
    /** Giá gốc của sản phẩm trước khi giảm giá */
    price: z.number().optional(),
    /** Giá thực tế áp dụng sau khi đã tính toán các mức giảm giá */
    priceAfterDiscount: z.number().optional(),
    /** Số lượng sản phẩm hiện còn trong kho của hệ thống */
    inStock: z.number().optional(),
    /** URL hình ảnh thu nhỏ đại diện cho sản phẩm */
    mainImage: z.string().optional(),
});

/**
 * Bản phác thảo Cấu trúc Giỏ hàng (Cart Map Schema)
 * 
 * Định nghĩa cấu trúc tổng thể của giỏ hàng bao gồm danh sách các mục và thông tin phân trang.
 */
export const CartMapSchema = z.object({
    /** Mã định danh duy nhất của giỏ hàng (theo session hoặc user) */
    cartId: z.string().optional(),
    /** Mã định danh khách hàng sở hữu giỏ hàng này */
    customerId: z.string().optional(),
    /** Thời điểm cập nhật giỏ hàng lần cuối (ISO Timestamp) */
    updatedAt: z.string().optional(),
    /** Danh sách các mục sản phẩm hiện có trong giỏ */
    cartItems: z.array(CartItemSchema).default([]),
    /** Tổng số lượng mục sản phẩm duy nhất trong toàn bộ giỏ (phục vụ phân trang) */
    totalItems: z.number().optional(),
    /** Số lượng mục hiển thị trên mỗi trang giỏ hàng */
    pageSize: z.number().optional(),
    /** Trang hiện tại người dùng đang xem trong giỏ hàng */
    currentPage: z.number().optional(),
});

/** Kiểu dữ liệu TypeScript suy diễn cho một Mục Giỏ hàng */
export type CartItem = z.infer<typeof CartItemSchema>;

/** Kiểu dữ liệu TypeScript suy diễn cấu trúc Giỏ hàng tổng thể */
export type CartMap = z.infer<typeof CartMapSchema>;

/**
 * Dữ liệu cần thiết khi gửi yêu cầu thêm sản phẩm mới vào giỏ hàng.
 */
export interface AddToCartPayload {
    /** ID của sản phẩm cần thêm */
    productId: string;
    /** ID biến thể cụ thể mà người dùng chọn */
    variantId: string;
}

/**
 * Dữ liệu cần thiết để tính toán tổng tiền giỏ hàng (POST /api/carts/price).
 */
export interface CalculatePricePayload {
    /** Có bao gồm mã giảm giá tự động của hệ thống không */
    includeDiscount?: boolean;
    /** ID của mã giảm giá cụ thể mà người dùng áp dụng */
    userDiscountId?: string;
    /** Danh sách ID các mục trong giỏ cần tính toán (cho phép đặt hàng từng phần) */
    cartItemIds: string[];
}
/**
 * Dữ liệu phản hồi sau khi thay đổi số lượng một bản ghi trong giỏ hàng.
 */
export interface CartItemActionResponse {
    /** Mã định danh của mục giỏ hàng */
    cartItemId: string;
    /** Số lượng mới của mục này trong giỏ hàng */
    quantityInCart: number;
    /** Số lượng sản phẩm còn lại trong kho hệ thống */
    quantityInStock: number;
}
