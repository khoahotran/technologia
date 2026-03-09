import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addToCart, decreaseQuantity, getCart, increaseQuantity, removeFromCart } from "./api";
import type { AddToCartPayload, Cart } from "./types";

import { cartKeys } from "@/constants/query-keys";

export function useCart() {
  const queryClient = useQueryClient();
  const cartQueryKey = cartKeys.all;

  const query = useQuery({
    queryKey: cartQueryKey,
    queryFn: getCart,
  });

  const addMutation = useMutation({
    mutationFn: addToCart,
    onMutate: async (_payload: AddToCartPayload) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey);
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          totalItems: (previousCart.totalItems ?? previousCart.cartItems.length) + 1,
        });
      }
      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success("Added to cart");
    },
  });

  const increaseMutation = useMutation({
    mutationFn: increaseQuantity,
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey);
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          cartItems: previousCart.cartItems.map((item) =>
            item.cartItemId === itemId
              ? { ...item, currentQuantity: item.currentQuantity + 1 }
              : item
          ),
        });
      }
      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });

  const decreaseMutation = useMutation({
    mutationFn: decreaseQuantity,
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey);
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          cartItems: previousCart.cartItems.map((item) =>
            item.cartItemId === itemId
              ? { ...item, currentQuantity: Math.max(1, item.currentQuantity - 1) }
              : item
          ),
        });
      }
      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKey);
      if (previousCart) {
        const nextItems = previousCart.cartItems.filter((item) => item.cartItemId !== itemId);
        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          cartItems: nextItems,
          totalItems: nextItems.length,
        });
      }
      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success("Removed from cart");
    },
  });

  return {
    ...query,
    cart: query.data,
    addToCart: addMutation.mutate,
    isAdding: addMutation.isPending,
    increase: increaseMutation.mutate,
    decrease: decreaseMutation.mutate,
    remove: removeMutation.mutate,
  };
}
