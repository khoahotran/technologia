import { z } from 'zod';

/**
 * Cart Item Entity
 */
export const CartItemSchema = z.object({
    cartItemId: z.string(),
    productId: z.string(),
    variantId: z.string().optional(),
    currentQuantity: z.number(),
    name: z.string(),
    color: z.string().optional(),
    price: z.number().optional(),
    priceAfterDiscount: z.number().optional(),
    inStock: z.number().optional(),
    mainImage: z.string().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

/**
 * Cart Map Entity
 */
export const CartSchema = z.object({
    cartId: z.string().optional(),
    cartItems: z.array(CartItemSchema).default([]),
    totalItems: z.number().optional(),
    pageSize: z.number().optional(),
    currentPage: z.number().optional(),
});

export type Cart = z.infer<typeof CartSchema>;

/**
 * Add To Cart Payload
 */
export interface AddToCartPayload {
    productId: string;
    variantId: string;
}

/**
 * Cart Item Action Response (Increase/Decrease)
 */
export interface CartItemActionResponse {
    cartItemId: string;
    quantityInCart: number;
    quantityInStock: number;
}
