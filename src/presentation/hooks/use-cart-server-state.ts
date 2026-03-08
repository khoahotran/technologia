"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CartMap } from "@/domain/cart/entities/cart.entity";
import type {
  AddToCartPayload,
  CalculatePricePayload,
} from "@/domain/cart/entities/cart.entity";
import { CartRepository } from "@/infrastructure/repositories/cart/cart.repository";
import { QUERY_CONFIG } from "@/shared/constants/query.constants";
import { addProductToCartUseCase } from "@/src/application/use-cases/add-product-to-cart.use-case";
import { cartKeys } from "@/src/shared/constants/query-keys";

function patchCartQuantity(
  cart: CartMap,
  cartItemId: string,
  delta: 1 | -1
): CartMap {
  return {
    ...cart,
    cartItems: (cart.cartItems ?? []).map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, currentQuantity: Math.max(1, item.currentQuantity + delta) }
        : item
    ),
  };
}

function removeCartItem(cart: CartMap, cartItemId: string): CartMap {
  const nextItems = (cart.cartItems ?? []).filter((item) => item.cartItemId !== cartItemId);
  return {
    ...cart,
    cartItems: nextItems,
    totalItems: nextItems.length,
  };
}

export function useCartQueryState() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: () => CartRepository.getCart(),
    ...QUERY_CONFIG.DYNAMIC,
  });
}

export function useCartPriceQuery(cartItemIds: readonly string[]) {
  return useQuery({
    queryKey: cartKeys.price(cartItemIds),
    queryFn: () =>
      CartRepository.calculatePrice({
        includeDiscount: false,
        cartItemIds: [...cartItemIds],
      }),
    enabled: cartItemIds.length > 0,
    ...QUERY_CONFIG.DYNAMIC,
  });
}

export function useAddToCartAction() {
  const queryClient = useQueryClient();
  const cartKey = cartKeys.detail();

  return useMutation({
    mutationFn: ({
      payload,
      quantity,
    }: {
      payload: AddToCartPayload;
      quantity?: number;
    }) => addProductToCartUseCase(payload, quantity),
    onMutate: async ({ payload, quantity = 1 }) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previousCart = queryClient.getQueryData<CartMap>(cartKey);

      if (previousCart) {
        const items = [...(previousCart.cartItems ?? [])];
        const matchedItem = items.find(
          (item) =>
            item.productId === payload.productId && item.variantId === payload.variantId
        );

        if (matchedItem) {
          matchedItem.currentQuantity += quantity;
        } else {
          items.unshift({
            cartItemId: `optimistic-${payload.productId}-${payload.variantId}-${Date.now()}`,
            productId: payload.productId,
            variantId: payload.variantId,
            currentQuantity: quantity,
            name: "Pending cart item",
          });
        }

        queryClient.setQueryData<CartMap>(cartKey, {
          ...previousCart,
          cartItems: items,
          totalItems: items.length,
        });
      }

      return { previousCart };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKey, context.previousCart);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

function createCartMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<unknown>,
  optimisticUpdater: (cart: CartMap, payload: TPayload) => CartMap
) {
  return function useCartMutation() {
    const queryClient = useQueryClient();
    const cartKey = cartKeys.detail();

    return useMutation({
      mutationFn,
      onMutate: async (payload: TPayload) => {
        await queryClient.cancelQueries({ queryKey: cartKey });
        const previousCart = queryClient.getQueryData<CartMap>(cartKey);

        if (previousCart) {
          queryClient.setQueryData<CartMap>(cartKey, optimisticUpdater(previousCart, payload));
        }

        return { previousCart };
      },
      onError: (_error, _payload, context) => {
        if (context?.previousCart) {
          queryClient.setQueryData(cartKey, context.previousCart);
        }
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: cartKeys.all });
      },
    });
  };
}

export const useIncreaseCartItemAction = createCartMutation(
  (cartItemId: string) => CartRepository.increase(cartItemId),
  (cart, cartItemId) => patchCartQuantity(cart, cartItemId, 1)
);
export const useDecreaseCartItemAction = createCartMutation(
  (cartItemId: string) => CartRepository.decrease(cartItemId),
  (cart, cartItemId) => patchCartQuantity(cart, cartItemId, -1)
);
export const useRemoveCartItemAction = createCartMutation(
  (cartItemId: string) => CartRepository.remove(cartItemId),
  (cart, cartItemId) => removeCartItem(cart, cartItemId)
);

export function useCartPriceMutationAction() {
  return useMutation({
    mutationFn: (payload: CalculatePricePayload) =>
      CartRepository.calculatePrice(payload),
  });
}
