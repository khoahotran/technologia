"use client";

import type { AddToCartPayload, CalculatePricePayload } from "@/domain";
import {
  useAddToCartAction,
  useCartPriceMutationAction,
  useCartPriceQuery,
  useCartQueryState,
  useDecreaseCartItemAction,
  useIncreaseCartItemAction,
  useRemoveCartItemAction,
} from "@/src/presentation/hooks/use-cart-server-state";
import { queryKeys } from "@/src/shared/constants/query-keys";

export const cartKeys = {
  all: queryKeys.cart.all,
  detail: queryKeys.cart.detail,
  price: (cartItemIds: string[]) => queryKeys.cart.price(cartItemIds),
};

export function useCartQuery() {
  return useCartQueryState();
}

export function useCartPriceQueryState(cartItemIds: readonly string[]) {
  return useCartPriceQuery(cartItemIds);
}

export function useAddToCartMutation() {
  const mutation = useAddToCartAction();

  return {
    ...mutation,
    mutate: (payload: AddToCartPayload) => mutation.mutate({ payload }),
    mutateAsync: (payload: AddToCartPayload) => mutation.mutateAsync({ payload }),
  };
}

export function useAddProductToCartMutation() {
  return useAddToCartAction();
}

export function useIncreaseCartItemMutation() {
  return useIncreaseCartItemAction();
}

export function useDecreaseCartItemMutation() {
  return useDecreaseCartItemAction();
}

export function useRemoveCartItemMutation() {
  return useRemoveCartItemAction();
}

export function useCartPriceMutation() {
  return useCartPriceMutationAction();
}

export type { AddToCartPayload, CalculatePricePayload };
