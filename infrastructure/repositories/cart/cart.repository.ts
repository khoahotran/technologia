/**
 * Cart Repository
 *
 * Implements ICartRepository with unified HTTP client.
 * Handles:
 * - Cart retrieval and pagination
 * - Add/remove/increase/decrease cart items
 * - Cart price calculation
 * - Automatic response validation
 */

import { fetchWithToken } from "@/infrastructure/http";
import {
    CartItem,
    CartMap,
    CartMapSchema,
    CartItemSchema,
    AddToCartPayload,
    CalculatePricePayload
} from "@/domain/cart/entities/cart.entity";
import { ICartRepository, CartPagingParams } from "@/domain/cart/repositories/cart.repository.interface";
import {
    CartResponseSchema,
    CartItemActionResponseSchema,
    AddToCartResponseSchema,
    CartTotalPriceResponseSchema,
    CartItemDetailResponseSchema,
    CartItemListResponseSchema,
} from "@/shared/validators/api-schemas";
import { createScopedLogger } from "@/lib/logger";

const logger = createScopedLogger('CartRepository');

const EMPTY_CART: CartMap = { cartItems: [] };

// ===========================================
// Helper Functions
// ===========================================

/**
 * Extract cart data from API response
 */
function extractCartData(response: unknown): CartMap {
    try {
        const validated = CartResponseSchema.parse(response);
        return validated.data.map || EMPTY_CART;
    } catch (error) {
        logger.error('Failed to parse cart response', error);
        return EMPTY_CART;
    }
}

/**
 * Extract cart data from paginated listing response
 */
function extractCartDataFromList(response: unknown): CartMap {
    try {
        const validated = CartItemListResponseSchema.parse(response);
        return validated.data.map || EMPTY_CART;
    } catch (error) {
        logger.error('Failed to parse cart item list response', error);
        return EMPTY_CART;
    }
}

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
     * Lấy danh sách giỏ hàng kèm phân trang
     * Dùng khi giỏ hàng có quá nhiều mục và cần hiển thị từng trang.
     */
    async getCartWithPaging(params: CartPagingParams = {}): Promise<CartMap> {
        logger.debug('Fetching cart with paging', params as any);

        const response = await fetchWithToken("/carts", {
            method: 'GET',
            query: {
                page: String(params.page ?? 0),
                size: String(params.size ?? 10),
                ...(params.sortDir && { sortDir: params.sortDir }),
                ...(params.sortBy && { sortBy: params.sortBy }),
            },
        });

        return extractCartDataFromList(response);
    },

    /**
     * Lấy toàn bộ thông tin giỏ hàng hiện tại của người dùng
     */
    async getCart(): Promise<CartMap> {
        logger.debug('Fetching cart');

        const response = await fetchWithToken("/carts", {
            method: 'GET',
        });

        // Trích xuất và bóc tách dữ liệu từ cấu trúc Response API
        return extractCartData(response);
    },

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    async addToCart(payload: AddToCartPayload) {
        logger.debug('Adding to cart', payload as any);

        const response = await fetchWithToken("/carts/add-to-cart", {
            method: 'POST',
            body: payload,
        });

        // Xác thực kết quả thao tác từ Server
        const validated = AddToCartResponseSchema.parse(response);
        return validated.data;
    },

    /**
     * Tăng số lượng của một mục trong giỏ hàng lên 1 unit
     */
    async increase(cartItemId: string) {
        logger.debug('Increasing cart item', { cartItemId });

        const response = await fetchWithToken(
            `/cart-items/increase/${cartItemId}`,
            { method: 'PATCH' }
        );

        const validated = CartItemActionResponseSchema.parse(response);
        return validated.data;
    },

    /**
     * Giảm số lượng của một mục trong giỏ hàng xuống 1 unit
     */
    async decrease(cartItemId: string) {
        logger.debug('Decreasing cart item', { cartItemId });

        const response = await fetchWithToken(
            `/cart-items/decrease/${cartItemId}`,
            { method: 'PATCH' }
        );

        const validated = CartItemActionResponseSchema.parse(response);
        return validated.data;
    },

    /**
     * Xóa hoàn toàn một mục khỏi giỏ hàng
     */
    async remove(cartItemId: string) {
        logger.debug('Removing cart item', { cartItemId });

        await fetchWithToken(
            `/cart-items/delete/${cartItemId}`,
            { method: 'PATCH' }
        );
    },

    /**
     * Lấy thông tin chi tiết của một item cụ thể trong giỏ hàng
     */
    async getCartItem(cartItemId: string): Promise<CartItem> {
        logger.debug('Fetching cart item', { cartItemId });

        const response = await fetchWithToken(
            `/carts/item/${cartItemId}`,
            { method: 'GET' }
        );

        const validated = CartItemDetailResponseSchema.parse(response);
        // Xác thực sâu vào Model của Item để đảm bảo tính đúng đắn dữ liệu
        return CartItemSchema.parse(validated.data);
    },

    /**
     * Tính toán tổng giá trị cho các mục được chọn trong giỏ hàng
     * Hỗ trợ việc áp dụng mã giảm giá hoặc tính thuế phí từ Server.
     */
    async calculatePrice(payload: CalculatePricePayload): Promise<number> {
        logger.debug('Calculating cart price', payload as any);

        const response = await fetchWithToken("/carts/price", {
            method: 'POST',
            body: payload,
        });

        const validated = CartTotalPriceResponseSchema.parse(response);
        return validated.data;
    },
};
