/**
 * Kho lưu trữ Giỏ hàng (Cart Store)
 *
 * Quản lý trạng thái giỏ hàng ở phía Client sử dụng Zustand.
 * 
 * LƯU Ý QUAN TRỌNG:
 * - Store này chủ yếu phục vụ trạng thái UI nhanh (Optimistic UI) hoặc giỏ hàng tạm cho khách chưa login.
 * - Dữ liệu giỏ hàng chính thức trên Server được quản lý bởi TanStack Query trong 'use-cart.ts'.
 * - 'persist' middleware giúp lưu giỏ hàng vào LocalStorage để không bị mất khi F5.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem, CartItemInput, CartStore } from "./store.types";

import { logger } from "@/lib/logger";

// ===========================================
// Store Implementation
// ===========================================

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            // Khởi tạo State
            items: [],
            isLoading: false,

            // Actions - Các hàm xử lý nghiệp vụ giỏ hàng

            /**
             * Thêm sản phẩm vào giỏ hàng
             * Nếu sản phẩm đã tồn tại -> Tăng số lượng
             * Nếu chưa có -> Thêm mới vào danh sách
             */
            addItem: (product: CartItemInput, quantity: number = 1) => {
                const { items } = get();
                const existingItem = items.find((item) => item.productId === product.id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.productId === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    const newItem: CartItem = {
                        productId: product.id,
                        productName: product.name,
                        price: product.price,
                        image: product.image,
                        quantity,
                    };
                    set({ items: [...items, newItem] });
                }

                // Ghi log hành động marketing để tracking hành vi người dùng
                logger.action("ADD_TO_CART", {
                    productId: product.id,
                    productName: product.name,
                    quantity,
                });
            },

            /** Xóa bỏ hoàn toàn một sản phẩm khỏi giỏ hàng */
            removeItem: (productId: string) => {
                const { items } = get();
                const item = items.find((i) => i.productId === productId);

                set({ items: items.filter((item) => item.productId !== productId) });

                logger.action("REMOVE_FROM_CART", {
                    productId,
                    productName: item?.productName,
                });
            },

            /** Cập nhật số lượng của một sản phẩm. Nếu số lượng <= 0 -> Xóa sản phẩm */
            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: get().items.map((item) =>
                        item.productId === productId ? { ...item, quantity } : item
                    ),
                });

                logger.action("UPDATE_CART_QUANTITY", { productId, quantity });
            },

            /** Xóa sạch toàn bộ giỏ hàng (VD: sau khi đặt hàng thành công) */
            clearCart: () => {
                set({ items: [] });
            },

            /** Tính toán tổng số tiền của các sản phẩm có trong giỏ hàng */
            getTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            /** Đếm tổng số lượng item (tổng n sản phẩm) */
            getItemCount: () => {
                const { items } = get();
                return items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            // Tên khóa lưu vào LocalStorage
            name: "cart-storage",
        }
    )
);

// ===========================================
// Selectors - Các hàm lọc dữ liệu tối ưu Re-render
// ===========================================

export const selectCartItems = (state: CartStore) => state.items;
export const selectCartIsLoading = (state: CartStore) => state.isLoading;

// ===========================================
// Hook - Giao diện React cho Component
// ===========================================

/**
 * Hook tiện ích để lấy toàn bộ thông tin và hành động của giỏ hàng.
 * Tự động tính toán 'total' và 'itemCount' mỗi khi state thay đổi.
 */
export function useCart() {
    const items = useCartStore(selectCartItems);
    const isLoading = useCartStore(selectCartIsLoading);
    const addItem = useCartStore((state) => state.addItem);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const clearCart = useCartStore((state) => state.clearCart);
    const getTotal = useCartStore((state) => state.getTotal);
    const getItemCount = useCartStore((state) => state.getItemCount);

    return {
        items,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        // Các giá trị tính toán (Computed values)
        total: getTotal(),
        itemCount: getItemCount(),
    };
}
