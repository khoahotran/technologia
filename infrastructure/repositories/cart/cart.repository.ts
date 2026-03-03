import { z } from "zod";

import {
    CartItem,
    CartMap,
    CartMapSchema,
    CartItemSchema,
    AddToCartPayload,
    CalculatePricePayload
} from "@/domain/cart/entities/cart.entity";
import { ICartRepository, CartPagingParams } from "@/domain/cart/repositories/cart.repository.interface";
import { httpClient } from "@/infrastructure/http/client";

const CartResponseSchema = z.object({
    status: z.number(),
    data: z.object({
        map: CartMapSchema,
        empty: z.boolean().optional(),
    }).optional(),
    message: z.string().optional(),
});

const CartItemMutationResponseSchema = z.object({
    status: z.number(),
    data: z.object({
        cartItemId: z.string().optional(),
        productId: z.string().optional(),
        variantId: z.string().optional(),
        quantityInCart: z.number().optional(),
        quantityInStock: z.number().optional(),
    }).nullable().optional(),
    message: z.string().optional(),
});

const CartPriceResponseSchema = z.object({
    status: z.number(),
    data: z.number(),
    message: z.string().optional(),
});

const EMPTY_CART: CartMap = { cartItems: [] };

export const CartRepository: ICartRepository = {
    async getCartWithPaging(params: CartPagingParams = {}): Promise<CartMap> {
        const { data } = await httpClient.get("/carts/with-items-paging", {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 10,
                sortDir: params.sortDir,
                sortBy: params.sortBy,
            },
        });
        const parsed = CartResponseSchema.parse(data);
        return parsed.data?.map ?? { cartItems: [] };
    },

    async getCart(): Promise<CartMap> {
        const { data } = await httpClient.get("/carts");
        const parsed = CartResponseSchema.parse(data);
        return parsed.data?.map ?? EMPTY_CART;
    },

    async addToCart(payload: AddToCartPayload) {
        const { data } = await httpClient.post("/carts/add-to-cart", payload);
        return CartItemMutationResponseSchema.parse(data);
    },

    async increase(cartItemId: string) {
        const { data } = await httpClient.patch(`/cart-items/increase/${cartItemId}`);
        return CartItemMutationResponseSchema.parse(data);
    },

    async decrease(cartItemId: string) {
        const { data } = await httpClient.patch(`/cart-items/decrease/${cartItemId}`);
        return CartItemMutationResponseSchema.parse(data);
    },

    async remove(cartItemId: string) {
        const { data } = await httpClient.delete(`/cart-items/delete/${cartItemId}`);
        return CartItemMutationResponseSchema.parse(data);
    },

    async getCartItem(cartItemId: string): Promise<CartItem> {
        const { data } = await httpClient.get(`/carts/item/${cartItemId}`);
        const parsed = z.object({ status: z.number(), data: CartItemSchema }).parse(data);
        return parsed.data;
    },

    async calculatePrice(payload: CalculatePricePayload): Promise<number> {
        const { data } = await httpClient.post("/carts/price", payload);
        const parsed = CartPriceResponseSchema.parse(data);
        return parsed.data;
    },
};
