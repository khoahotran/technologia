/**
 * Cart Store
 *
 * Manages shopping cart state:
 * - Cart items
 * - Add/remove/update operations
 * - Cart totals
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { logger } from "@/lib/logger";
import type { Product } from "@/lib/mock-data";
import type { CartItem, CartStore } from "./store.types";

// ===========================================
// Store Implementation
// ===========================================

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            // State
            items: [],
            isLoading: false,

            // Actions
            addItem: (product: Product, quantity: number = 1) => {
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

                logger.action("ADD_TO_CART", {
                    productId: product.id,
                    productName: product.name,
                    quantity,
                });
            },

            removeItem: (productId: string) => {
                const { items } = get();
                const item = items.find((i) => i.productId === productId);

                set({ items: items.filter((item) => item.productId !== productId) });

                logger.action("REMOVE_FROM_CART", {
                    productId,
                    productName: item?.productName,
                });
            },

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

            clearCart: () => {
                set({ items: [] });
                logger.info("Cart cleared");
            },

            getTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getItemCount: () => {
                const { items } = get();
                return items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: "cart-storage",
        }
    )
);

// ===========================================
// Selectors
// ===========================================

export const selectCartItems = (state: CartStore) => state.items;
export const selectCartIsLoading = (state: CartStore) => state.isLoading;

// ===========================================
// Hooks
// ===========================================

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
        total: getTotal(),
        itemCount: getItemCount(),
    };
}
