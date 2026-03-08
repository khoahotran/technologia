/**
 * Triển khai Cart Repository (Cart Repository Implementation)
 *
 * Triển khai `ICartRepository` sử dụng HTTP client thống nhất (fetchWithToken).
 * Chịu trách nhiệm cho tất cả các thao tác liên quan đến giỏ hàng:
 * - Lấy danh sách giỏ hàng (có và không có phân trang)
 * - Thêm / Xóa / Tăng / Giảm số lượng sản phẩm trong giỏ
 * - Tính toán tổng giá trị
 * - Tự động xác thực dữ liệu Response
 */

import { z } from "zod";

import {
    CartItem,
    CartMap,
    CartItemSchema,
    AddToCartPayload,
    CalculatePricePayload
} from "@/domain/cart/entities/cart.entity";
import { ICartRepository } from "@/domain/cart/repositories/cart.repository.interface";
import { fetchWithToken, adaptResponse } from "@/infrastructure/http";
import { createScopedLogger } from "@/lib/logger";
import { safeSync } from "@/shared/utils/result";
import {
    CartResponseSchema,
    CartItemActionResponseSchema,
    AddToCartResponseSchema,
} from "@/shared/validators/api-schemas";

const logger = createScopedLogger('CartRepository');

// ===========================================
// Cart Repository Implementation
// ===========================================

/**
 * Triển khai Cart Repository
 *
 * Quản lý giỏ hàng của người dùng thông qua các API chuyên biệt.
 * Repository này xử lý việc thêm, xóa, cập nhật số lượng và tính toán giá trị giỏ hàng.
 */
export const CartRepository: ICartRepository = {
    /**
     * Lấy toàn bộ thông tin giỏ hàng hiện tại của người dùng
     */
    async getCart(page?: number, size?: number): Promise<CartMap> {
        logger.debug('Fetching cart', { page, size });

        const response = await fetchWithToken("/carts", {
            method: 'GET',
            query: {
                ...(page !== undefined && { page: String(page) }),
                ...(size !== undefined && { size: String(size) }),
            }
        });

        const result = adaptResponse(response, CartResponseSchema.shape.data, 'cart');
        return result.map;
    },

    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param payload Dữ liệu gồm productId, quantity và các tùy chọn variant
     */
    async addToCart(payload: AddToCartPayload): Promise<void> {
        logger.debug('Adding to cart', { ...payload });

        const response = await fetchWithToken("/carts/add-to-cart", {
            method: 'POST',
            body: payload,
        });

        // Xác thực kết quả thao tác từ Server
        safeSync(() => AddToCartResponseSchema.parse(response));
    },

    /**
     * Tăng số lượng của một mục trong giỏ hàng lên 1 unit
     * @param cartItemId Mã định danh của mục giỏ hàng cần tăng
     */
    async increase(cartItemId: string) {
        logger.debug('Increasing cart item', { cartItemId });

        const response = await fetchWithToken(
            `/cart-items/increase/${cartItemId}`,
            { method: 'PATCH' }
        );

        return adaptResponse(response, CartItemActionResponseSchema.shape.data, 'cart-item-increase');
    },

    /**
     * Giảm số lượng của một mục trong giỏ hàng xuống 1 unit
     * @param cartItemId Mã định danh của mục giỏ hàng cần giảm
     */
    async decrease(cartItemId: string) {
        logger.debug('Decreasing cart item', { cartItemId });

        const response = await fetchWithToken(
            `/cart-items/decrease/${cartItemId}`,
            { method: 'PATCH' }
        );

        return adaptResponse(response, CartItemActionResponseSchema.shape.data, 'cart-item-decrease');
    },

    /**
     * Xóa hoàn toàn một mục khỏi giỏ hàng
     * @param cartItemId Mã định danh của mục giỏ hàng cần xóa
     */
    async remove(cartItemId: string) {
        logger.debug('Removing cart item', { cartItemId });

        await fetchWithToken(
            `/cart-items/delete/${cartItemId}`,
            { method: 'DELETE' }
        );
    },

    /**
     * Lấy thông tin chi tiết của một item cụ thể trong giỏ hàng
     * @param cartItemId Mã định danh của mục giỏ hàng cần xem chi tiết
     */
    async getCartItem(cartItemId: string): Promise<CartItem> {
        logger.debug('Fetching cart item', { cartItemId });

        const response = await fetchWithToken(
            `/carts/item/${cartItemId}`,
            { method: 'GET' }
        );

        return adaptResponse(response, CartItemSchema, `cart-item-${cartItemId}`);
    },

    /**
     * Tính toán tổng giá trị cho các mục được chọn trong giỏ hàng
     * Hỗ trợ việc áp dụng mã giảm giá hoặc tính thuế phí từ Server.
     * @param payload Danh sách cartItemId được chọn để tính giá
     */
    async calculatePrice(payload: CalculatePricePayload): Promise<number> {
        logger.debug('Calculating cart price', { ...payload });

        const response = await fetchWithToken("/carts/price", {
            method: 'POST',
            body: payload,
        });

        return adaptResponse(response, z.number(), 'cart-price');
    },

    async updateQuantity(cartItemId: string, quantity: number): Promise<void> {
        logger.debug('Updating cart item quantity', { cartItemId, quantity });
        await fetchWithToken(`/cart-items/${cartItemId}`, {
            method: 'PATCH',
            body: { quantity }
        });
    },

    async removeFromCart(cartItemIds: string[]): Promise<void> {
        logger.debug('Removing multiple cart items', { cartItemIds });
        await fetchWithToken("/cart-items/batch-delete", {
            method: 'DELETE',
            body: { cartItemIds }
        });
    },

    async clearCart(): Promise<void> {
        logger.debug('Clearing whole cart');
        await fetchWithToken("/carts/clear", {
            method: 'POST'
        });
    }
};
