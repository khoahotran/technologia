"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    CartRepository,
    type AddToCartPayload,
    type CalculatePricePayload,
} from "@/infrastructure/repositories/cart/cart.repository";

export const cartKeys = {
    all: ["cart"] as const,
    detail: () => [...cartKeys.all, "detail"] as const,
    price: (cartItemIds: string[]) => [...cartKeys.all, "price", ...cartItemIds] as const,
};

export function useCartQuery() {
    return useQuery({
        queryKey: cartKeys.detail(),
        queryFn: () => CartRepository.getCart(),
        staleTime: 30 * 1000,
    });
}

export function useAddToCartMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddToCartPayload) => CartRepository.addToCart(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

export function useIncreaseCartItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cartItemId: string) => CartRepository.increase(cartItemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

export function useDecreaseCartItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cartItemId: string) => CartRepository.decrease(cartItemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

export function useRemoveCartItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cartItemId: string) => CartRepository.remove(cartItemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

export function useCartPriceMutation() {
    return useMutation({
        mutationFn: (payload: CalculatePricePayload) => CartRepository.calculatePrice(payload),
    });
}
