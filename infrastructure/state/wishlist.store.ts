/**
 * Kho lưu trữ Danh sách yêu thích (Wishlist Store)
 *
 * Quản lý danh sách các ID sản phẩm mà người dùng đã đánh dấu yêu thích.
 * Sử dụng LocalStorage để duy trì danh sách khi người dùng đóng trình duyệt.
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
            // Khởi tạo State: Mảng chứa các ID sản phẩm (string)
            items: [],

            // Actions

            /**
             * Đảo ngược trạng thái yêu thích của một sản phẩm
             * Nếu đã có trong danh sách -> Xóa đi
             * Nếu chưa có -> Thêm vào
             */
            toggle: (productId: string) => {
                const { items } = get();
                const isInList = items.includes(productId);

                if (isInList) {
                    get().remove(productId);
                } else {
                    get().add(productId);
                }
            },

            /** Thêm sản phẩm vào danh sách yêu thích (nếu chưa tồn tại) */
            add: (productId: string) => {
                const { items } = get();
                if (!items.includes(productId)) {
                    set({ items: [...items, productId] });
                    logger.action("ADD_TO_WISHLIST", { productId });
                }
            },

            /** Xóa sản phẩm khỏi danh sách yêu thích */
            remove: (productId: string) => {
                set({ items: get().items.filter((id) => id !== productId) });
                logger.action("REMOVE_FROM_WISHLIST", { productId });
            },

            /** Kiểm tra xem một sản phẩm cụ thể có nằm trong Wishlist không */
            isInWishlist: (productId: string) => {
                return get().items.includes(productId);
            },

            /** Làm sạch toàn bộ danh sách yêu thích */
            clear: () => {
                set({ items: [] });
            },
        }),
        {
            // Tên khóa lưu vào LocalStorage
            name: "wishlist-storage",
        }
    )
);

// ===========================================
// Selectors - Tối ưu truy xuất dữ liệu
// ===========================================

export const selectWishlistItems = (state: WishlistStore) => state.items;
export const selectWishlistCount = (state: WishlistStore) => state.items.length;

// ===========================================
// Hooks - Giao diện React
// ===========================================

/**
 * Hook tiện ích để tương tác với Danh sách yêu thích từ UI.
 * Cung cấp danh sách ID, số lượng và các hàm thao tác.
 */
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
