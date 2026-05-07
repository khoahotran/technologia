import { z } from 'zod';

/**
 * Cart Item Entity
 */
export const CartItemSchema = z.object({
    cartItemId: z.string(),
    productId: z.string(),
    variantId: z.string(),
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

export type CartItem = z.infer<typeof CartItemSchema>;

/**
 * Cart Map Entity
 */
export const CartSchema = z.object({
    cartId: z.string(),
    customerId: z.string(),
    updatedAt: z.string().optional(),
    cartItems: z.array(CartItemSchema).default([]),
    totalItems: z.number(),
    pageSize: z.number(),
    currentPage: z.number(),
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

/**
 * Price Calculation Request
 */
export const CountPriceRequestSchema = z.object({
    includeDiscount: z.boolean(),
    userDiscountId: z.string().uuid().nullable().optional(),
    cartItemIds: z.array(z.string().uuid()),
});

export type CountPriceRequest = z.infer<typeof CountPriceRequestSchema>;

/**
 * Price Breakdown for each item
 */
export const PriceResponseSchema = z.object({
    productId: z.string().uuid(),
    variantId: z.string(),
    price: z.number(),
    quantity: z.number(),
    canUseDiscount: z.boolean(),
    discountValue: z.number(),
    finalPrice: z.number(),
});

export type PriceResponse = z.infer<typeof PriceResponseSchema>;

/**
 * Price Calculation Response
 */
export const CountPriceResponseSchema = z.object({
    totalPrice: z.number(),
    totalDiscount: z.number(),
    priceResponse: z.array(PriceResponseSchema),
});

export type CountPriceResponse = z.infer<typeof CountPriceResponseSchema>;
