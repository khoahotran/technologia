import type { AddToCartPayload, Cart, CartItemActionResponse } from "./types";
import { CartSchema } from "./types";

import { del, get, patch, post } from "@/api/client";
import type { ApiResponse } from "@/types";

export async function getCart(): Promise<Cart> {
  const response = await get<ApiResponse<Cart>>("/api/carts");
  return CartSchema.parse(response.data);
}

export async function addToCart(payload: AddToCartPayload): Promise<void> {
  await post<ApiResponse<unknown>>("/api/carts/add-to-cart", payload);
}

export async function increaseQuantity(itemId: string): Promise<CartItemActionResponse> {
  const response = await patch<ApiResponse<CartItemActionResponse>>(
    `/api/cart-items/increase/${itemId}`
  );
  return response.data;
}

export async function decreaseQuantity(itemId: string): Promise<CartItemActionResponse> {
  const response = await patch<ApiResponse<CartItemActionResponse>>(
    `/api/cart-items/decrease/${itemId}`
  );
  return response.data;
}

export async function removeFromCart(itemId: string): Promise<void> {
  await del<ApiResponse<unknown>>(`/api/cart-items/delete/${itemId}`);
}
