/**
 * Global store barrel — single import point for all Zustand stores.
 *
 * Auth & session  → useAuthStore
 * Local cart      → useCartStore   (optimistic / guest)
 * Wishlist        → useWishlistStore / useWishlist
 * UI state        → useUiStore
 */

export { useAuthStore } from './auth.store';
export type { AuthSession, AuthUser } from './auth.store';

export { useCartStore, selectCartItems, selectCartIsLoading } from './cart.store';
export type { CartItem, CartItemInput } from './cart.store';

export {
    useWishlistStore,
    useWishlist,
    selectWishlistItems,
    selectWishlistCount,
} from './wishlist.store';
export type { WishlistStore } from './wishlist.store';

export { useUiStore } from './ui.store';
