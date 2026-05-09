import type { AddToCartPayload, Cart, CartItemActionResponse, CountPriceRequest, CountPriceResponse } from "./types";
import { CartSchema, CountPriceResponseSchema } from "./types";

import { del, get, patch, post } from "@/api/client";
import type { ApiResponse } from "@/types";

export async function getCart(): Promise<Cart> {
  const response = await get<ApiResponse<Cart>>("/api/carts", {
    headers: { "x-no-redirect": "true" },
  });
  // The backend might return the cart object directly or wrapped in a 'map' property (from Vert.x JsonObject)
  const cartData = (response.data as Record<string, unknown>)['map'] || response.data;
  return CartSchema.parse(cartData);
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

/**
 * Calculate cart price for reference only.
 * For actual checkout price, use recalculateCheckout API on the shipping page.
 */
export async function calculateCartPrice(data: CountPriceRequest): Promise<CountPriceResponse> {
  const response = await post<ApiResponse<CountPriceResponse>>("/api/carts/price", data);
  return CountPriceResponseSchema.parse(response.data);
}
