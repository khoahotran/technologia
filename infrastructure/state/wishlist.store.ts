/**
 * Wishlist Store
 *
 * Manages wishlist state:
 * - Product IDs in wishlist
 * - Toggle, add, remove operations
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { WishlistStore } from "./store.types";

import { logger } from "@/lib/logger";

// ===========================================
// Store Implementation
// ===========================================

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            // State
            items: [],

            // Actions
            toggle: (productId: string) => {
                const { items } = get();
                const isInList = items.includes(productId);

                if (isInList) {
                    get().remove(productId);
                } else {
                    get().add(productId);
                }
            },

            add: (productId: string) => {
                const { items } = get();
                if (!items.includes(productId)) {
                    set({ items: [...items, productId] });
                    logger.action("ADD_TO_WISHLIST", { productId });
                }
            },

            remove: (productId: string) => {
                set({ items: get().items.filter((id) => id !== productId) });
                logger.action("REMOVE_FROM_WISHLIST", { productId });
            },

            isInWishlist: (productId: string) => {
                return get().items.includes(productId);
            },

            clear: () => {
                set({ items: [] });
                logger.info("Wishlist cleared");
            },
        }),
        {
            name: "wishlist-storage",
        }
    )
);

// ===========================================
// Selectors
// ===========================================

export const selectWishlistItems = (state: WishlistStore) => state.items;
export const selectWishlistCount = (state: WishlistStore) => state.items.length;

// ===========================================
// Hooks
// ===========================================

export function useWishlist() {
    const items = useWishlistStore(selectWishlistItems);
    const toggle = useWishlistStore((state) => state.toggle);
    const add = useWishlistStore((state) => state.add);
    const remove = useWishlistStore((state) => state.remove);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist);
    const clear = useWishlistStore((state) => state.clear);

    return {
        items,
        count: items.length,
        toggle,
        add,
        remove,
        isInWishlist,
        clear,
    };
}
