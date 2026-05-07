/**
 * Cart Store — client-side Zustand cart for optimistic UI / guest users.
 * Server-synced cart data lives in features/cart/hooks.ts (TanStack Query).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logger } from '@/utils/logger';

export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    image?: string | undefined;
    quantity: number;
    variantId?: string | undefined;
}

/** Minimal data needed to add an item to the local cart. */
export interface CartItemInput {
    id: string;
    name: string;
    price: number;
    image?: string | undefined;
}

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    addItem: (product: CartItemInput, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,

            addItem: (product, quantity = 1) => {
                if (quantity <= 0) return;
                const { items } = get();
                const existing = items.find((i) => i.productId === product.id);
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.productId === product.id
                                ? { ...i, quantity: i.quantity + quantity }
                                : i
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                productId: product.id,
                                productName: product.name,
                                price: product.price,
                                image: product.image,
                                quantity,
                            },
                        ],
                    });
                }
                logger.action('ADD_TO_CART', { productId: product.id, quantity });
            },

            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.productId !== productId) });
                logger.action('REMOVE_FROM_CART', { productId });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    ),
                });
                logger.action('UPDATE_CART_QUANTITY', { productId, quantity });
            },

            clearCart: () => set({ items: [] }),

            getTotal: () =>
                get().items.reduce((total, i) => total + i.price * i.quantity, 0),

            getItemCount: () =>
                get().items.reduce((count, i) => count + i.quantity, 0),
        }),
        { name: 'cart-storage' }
    )
);

// Selectors
export const selectCartItems = (s: CartState) => s.items;
export const selectCartIsLoading = (s: CartState) => s.isLoading;
