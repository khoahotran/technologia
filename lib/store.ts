/**
 * @deprecated This monolithic store is superseded by the split stores in
 * `@/infrastructure/state/` (auth.store, cart.store, wishlist.store).
 *
 * This stub re-exports from those focused stores for backward compatibility.
 * Migrate usages gradually:
 *   useStore(s => s.currentUser)   → useAuth()
 *   useStore(s => s.cart)          → useCart() or useCartQuery()
 *   useStore(s => s.wishlist)      → useWishlist()
 */
export { useAuthStore } from "@/infrastructure/state/auth.store";
export { useCartStore } from "@/infrastructure/state/cart.store";
export { useWishlistStore } from "@/infrastructure/state/wishlist.store";
