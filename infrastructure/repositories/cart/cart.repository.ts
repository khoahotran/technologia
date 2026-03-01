import { z } from "zod";

import { httpClient } from "@/infrastructure/http/client";

const CartItemSchema = z.object({
    cartItemId: z.string(),
    productId: z.string(),
    variantId: z.string().optional(),
    addAt: z.string().optional(),
    updateAt: z.string().optional(),
    currentQuantity: z.number(),
    name: z.string(),
    color: z.string().optional(),
    price: z.number().optional(),
    priceAfterDiscount: z.number().optional(),
    inStock: z.number().optional(),
    mainImage: z.string().optional(),
});

const CartMapSchema = z.object({
    cartId: z.string().optional(),
    customerId: z.string().optional(),
    updatedAt: z.string().optional(),
    cartItems: z.array(CartItemSchema).default([]),
    totalItems: z.number().optional(),
    pageSize: z.number().optional(),
    currentPage: z.number().optional(),
});

const CartResponseSchema = z.object({
    status: z.number(),
    data: z
        .object({
            map: CartMapSchema,
            empty: z.boolean().optional(),
        })
        .optional(),
    message: z.string().optional(),
});

const CartItemMutationResponseSchema = z.object({
    status: z.number(),
    data: z
        .object({
            cartItemId: z.string().optional(),
            productId: z.string().optional(),
            variantId: z.string().optional(),
            quantityInCart: z.number().optional(),
            quantityInStock: z.number().optional(),
        })
        .nullable()
        .optional(),
    message: z.string().optional(),
});

const CartPriceResponseSchema = z.object({
    status: z.number(),
    data: z.number(),
    message: z.string().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type CartMap = z.infer<typeof CartMapSchema>;

export interface AddToCartPayload {
    productId: string;
    variantId: string;
}

export interface CalculatePricePayload {
    includeDiscount?: boolean;
    userDiscountId?: string;
    cartItemIds: string[];
}

const EMPTY_CART: CartMap = { cartItems: [] };

export const CartRepository = {
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
        // backend expects DELETE for removing a cart item (see Postman collection)
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
