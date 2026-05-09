import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addToCart, decreaseQuantity, getCart, increaseQuantity, removeFromCart } from "./api";
import type { AddToCartPayload, Cart } from "./types";

import { cartKeys } from "@/constants/query-keys";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

export function useCart() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const cartQueryKey = cartKeys.all;

  const query = useQuery({
    queryKey: cartQueryKey,
    queryFn: async () => {
      try {
        return await getCart();
      } catch (error: any) {
        if (error?.statusCode === 401 || error?.statusCode === 403) {
          return {
            cartId: "",
            customerId: "",
            cartItems: [],
            totalItems: 0,
            pageSize: 20,
            currentPage: 0,
          } as Cart;
        }
        throw error;
      }
    },
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
      toast.error(t(toErrorMessage(_error, "err_cart_error")));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success(t("added_to_cart", {}, "Added to cart"));
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
      toast.error(t(toErrorMessage(_error, "err_cart_error")));
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
      toast.error(t(toErrorMessage(_error, "err_cart_error")));
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
      toast.error(t(toErrorMessage(_error, "err_cart_error")));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success(t("removed_from_cart", {}, "Removed from cart"));
    },
  });

  return {
    ...query,
    cart: query.data,
    addToCart: addMutation.mutate,
    addToCartAsync: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    increase: increaseMutation.mutate,
    decrease: decreaseMutation.mutate,
    remove: removeMutation.mutate,
  };
}
