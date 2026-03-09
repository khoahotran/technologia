/**
 * Store barrel — re-exports all Zustand stores from the canonical `src/store/` location.
 * @deprecated Import directly from `@/store` instead.
 */

export { useAuthStore } from '@/features/auth/store';
export { useCartStore } from '@/store/cart.store';
export { useWishlistStore } from '@/store/wishlist.store';
