import { z } from "zod";

export const CartItemSchema = z.object({
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

export const CartMapSchema = z.object({
    cartId: z.string().optional(),
    customerId: z.string().optional(),
    updatedAt: z.string().optional(),
    cartItems: z.array(CartItemSchema).default([]),
    totalItems: z.number().optional(),
    pageSize: z.number().optional(),
    currentPage: z.number().optional(),
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
