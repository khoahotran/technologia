"use client";

/**
 * Hooks quản lý Giỏ hàng (Cart-related hooks)
 * 
 * Sử dụng TanStack Query để quản lý đồng bộ trạng thái giỏ hàng giữa Client và Server.
 * Cung cấp các thao tác: Lấy giỏ hàng, Thêm sản phẩm, Tăng/Giảm số lượng, Xóa sản phẩm.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    AddToCartPayload,
    CalculatePricePayload
} from "@/domain";
import {
    CartRepository,
} from "@/infrastructure/repositories/cart/cart.repository";
import { QUERY_CONFIG } from "@/shared/constants/query.constants";

/**
 * Định nghĩa các Query Keys dùng để quản lý cache bộ nhớ của giỏ hàng.
 */
export const cartKeys = {
    all: ["cart"] as const,
    detail: () => [...cartKeys.all, "detail"] as const,
    price: (cartItemIds: string[]) => [...cartKeys.all, "price", ...cartItemIds] as const,
};

/**
 * Hook truy vấn lấy thông tin chi tiết giỏ hàng hiện tại của người dùng.
 */
export function useCartQuery() {
    return useQuery({
        queryKey: cartKeys.detail(),
        queryFn: () => CartRepository.getCart(),
        ...QUERY_CONFIG.DYNAMIC, // Cấu hình lấy dữ liệu động (ko cache lâu)
    });
}

/**
 * Hook Mutation: Thêm một sản phẩm mới vào giỏ hàng.
 */
export function useAddToCartMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddToCartPayload) => CartRepository.addToCart(payload),
        onSuccess: () => {
            // Sau khi thêm thành công, xóa cache "cart" cũ để Query tải lại dữ liệu mới nhất
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

/**
 * Hook Mutation: Tăng số lượng của một dòng sản phẩm trong giỏ hàng.
 */
export function useIncreaseCartItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cartItemId: string) => CartRepository.increase(cartItemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

/**
 * Hook Mutation: Giảm số lượng của một dòng sản phẩm trong giỏ hàng.
 */
export function useDecreaseCartItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cartItemId: string) => CartRepository.decrease(cartItemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

/**
 * Hook Mutation: Xóa hoàn toàn một dòng sản phẩm khỏi giỏ hàng.
 */
export function useRemoveCartItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cartItemId: string) => CartRepository.remove(cartItemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

/**
 * Hook Mutation: Tính toán tổng giá tiền dựa trên danh sách các ID sản phẩm được chọn.
 * Dùng cho màn hình Checkout khi người dùng chọn mua một vài món nhất định.
 */
export function useCartPriceMutation() {
    return useMutation({
        mutationFn: (payload: CalculatePricePayload) => CartRepository.calculatePrice(payload),
    });
}
