/**
 * Wishlist Store — client-side persisted list of favourited product IDs.
 * Pure local state; no backend calls.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logger } from '@/utils/logger';

export interface WishlistStore {
    items: string[];
    toggle: (productId: string) => void;
    add: (productId: string) => void;
    remove: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            toggle: (productId) => {
                if (get().items.includes(productId)) {
                    get().remove(productId);
                } else {
                    get().add(productId);
                }
            },

            add: (productId) => {
                if (!get().items.includes(productId)) {
                    set({ items: [...get().items, productId] });
                    logger.action('ADD_TO_WISHLIST', { productId });
                }
            },

            remove: (productId) => {
                set({ items: get().items.filter((id) => id !== productId) });
                logger.action('REMOVE_FROM_WISHLIST', { productId });
            },

            isInWishlist: (productId) => get().items.includes(productId),

            clear: () => set({ items: [] }),
        }),
        { name: 'wishlist-storage' }
    )
);

// Selectors
export const selectWishlistItems = (s: WishlistStore) => s.items;
export const selectWishlistCount = (s: WishlistStore) => s.items.length;

/** Convenience hook with derived count. */
export function useWishlist() {
    const store = useWishlistStore();
    return {
        ...store,
        count: store.items.length,
    };
}
