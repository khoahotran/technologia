/**
 * Wishlist feature entry point — re-exports from the canonical store.
 */

export {
    useWishlistStore,
    useWishlist,
    selectWishlistItems,
    selectWishlistCount,
} from '@/store/wishlist.store';
export type { WishlistStore } from '@/store/wishlist.store';
