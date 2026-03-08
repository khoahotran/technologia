import type { AddToCartPayload } from "@/domain/cart/entities/cart.entity";
import { CartRepository } from "@/infrastructure/repositories/cart/cart.repository";

export async function addProductToCartUseCase(
  payload: AddToCartPayload,
  quantity = 1
) {
  const iterations = Math.max(1, quantity);

  for (let index = 0; index < iterations; index += 1) {
    await CartRepository.addToCart(payload);
  }

  return { added: iterations };
}
