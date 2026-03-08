"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AddToCartPayload,
  CalculatePricePayload,
} from "@/domain/cart/entities/cart.entity";
import { CartRepository } from "@/infrastructure/repositories/cart/cart.repository";
import { QUERY_CONFIG } from "@/shared/constants/query.constants";
import { addProductToCartUseCase } from "@/src/application/use-cases/add-product-to-cart.use-case";
import { queryKeys } from "@/src/shared/constants/query-keys";

export function useCartQueryState() {
  return useQuery({
    queryKey: queryKeys.cart.detail(),
    queryFn: () => CartRepository.getCart(),
    ...QUERY_CONFIG.DYNAMIC,
  });
}

export function useCartPriceQuery(cartItemIds: readonly string[]) {
  return useQuery({
    queryKey: queryKeys.cart.price(cartItemIds),
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

  return useMutation({
    mutationFn: ({
      payload,
      quantity,
    }: {
      payload: AddToCartPayload;
      quantity?: number;
    }) => addProductToCartUseCase(payload, quantity),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

function createCartMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<unknown>
) {
  return function useCartMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      },
    });
  };
}

export const useIncreaseCartItemAction = createCartMutation((cartItemId: string) =>
  CartRepository.increase(cartItemId)
);
export const useDecreaseCartItemAction = createCartMutation((cartItemId: string) =>
  CartRepository.decrease(cartItemId)
);
export const useRemoveCartItemAction = createCartMutation((cartItemId: string) =>
  CartRepository.remove(cartItemId)
);

export function useCartPriceMutationAction() {
  return useMutation({
    mutationFn: (payload: CalculatePricePayload) =>
      CartRepository.calculatePrice(payload),
  });
}
