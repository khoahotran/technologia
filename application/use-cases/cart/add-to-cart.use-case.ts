/**
 * Add to Cart Use-Case
 *
 * Orchestrates adding a product to the server-side cart:
 *  1. Call CartRepository.addToCart() via the payload
 *  2. Invalidate TanStack Query cache so CartQuery refetches
 *
 * The caller (mutation hook in presentation/) handles invalidation —
 * this use-case focuses purely on the repository call.
 *
 * For local/optimistic UI updates, use useCartStore.addItem() directly.
 */

import { CartRepository } from "@/infrastructure/repositories/cart/cart.repository";
import { getErrorMessage } from "@/domain/errors";
import type { AddToCartPayload } from "@/domain";

export type AddToCartResult = {
    ok: true;
} | {
    ok: false;
    error: string;
};

export async function addToCartUseCase(payload: AddToCartPayload): Promise<AddToCartResult> {
    try {
        // Gọi thẳng vào phương thức tĩnh addToCart của CartRepository, truyền payload chứa productId và variantId
        await CartRepository.addToCart(payload);

        // Trả về object kết quả ok: true báo hiệu cho Presentation Layer biết thao tác đã thành công
        return { ok: true };
    } catch (error) {
        // Bắt mọi Exception (DomainError, HttpError) có thể xay ra ở tầng Infrastructure
        // Gọi hàm getErrorMessage (từ Domain/Errors) để trích xuất câu báo lỗi thân thiện nhất
        // Trả về ok: false kèm chuỗi lỗi, giúp Presentation Layer dễ dàng hiển thị thông báo toast/alert
        return { ok: false, error: getErrorMessage(error) };
    }
}
