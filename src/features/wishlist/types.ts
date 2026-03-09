/**
 * Wishlist feature types.
 * The wishlist is client-side only (Zustand + localStorage).
 * No backend API exists for wishlist in this service.
 */

export interface WishlistItem {
    productId: string;
    addedAt?: string;
}
