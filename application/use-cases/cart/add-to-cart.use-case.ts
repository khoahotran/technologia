/**
 * UseCase Thêm vào giỏ hàng (Add to Cart Use-Case)
 *
 * Điều phối thao tác thêm sản phẩm vào giỏ hàng trên Server:
 *  1. Gọi CartRepository.addToCart() truyền vào dữ liệu cần thiết (payload)
 *  2. Phía component gọi use-case này (ví dụ mutation hook) sẽ đảm nhiệm việc hủy bỏ cache (invalidate) 
 *     để tự động tải lại giỏ hàng mới.
 *
 * Lưu ý: Use-case này chỉ tập trung xử lý kết nối với API (Repository).
 * Nếu muốn cập nhật trạng thái giỏ hàng chỉ ở phía giao diện (Optimistic UI), hãy sử dụng `useCartStore.addItem()` thay thế.
 */

import { CartRepository } from "@/infrastructure/repositories/cart/cart.repository";
import { getErrorMessage } from "@/domain/errors";
import type { AddToCartPayload } from "@/domain";

/** Kiểu dữ liệu trả về cho UI */
export type AddToCartResult = {
    ok: true;
} | {
    ok: false;
    error: string;
};

/**
 * Xử lý logic thêm sản phẩm vào giỏ hàng
 * @param payload Dữ liệu thêm sản phẩm (productId, quantity, variantId, etc.)
 */
export async function addToCartUseCase(payload: AddToCartPayload): Promise<AddToCartResult> {
    try {
        // Thực thi gọi hàm từ Repository để tương tác với Backend API
        await CartRepository.addToCart(payload);

        // Trả về { ok: true } cho Presentation Layer biết thao tác đã thành công
        return { ok: true };
    } catch (error) {
        // Bắt lỗi phát sinh từ Repository hoặc Network
        // Dùng `getErrorMessage` để trích xuất chuỗi báo lỗi thân thiện nhất
        return { ok: false, error: getErrorMessage(error) };
    }
}
