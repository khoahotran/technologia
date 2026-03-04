/**
 * @deprecated [KHÔNG KHUYÊN DÙNG] 
 * File store tổng hợp này đã bị thay thế bởi các Store riêng biệt nằm trong:
 * `@/infrastructure/state/` (auth.store, cart.store, wishlist.store).
 * 
 * File này hiện chỉ được giữ lại để duy trì tính tương thích ngược (Backward compatibility).
 * Hãy lộ trình chuyển đổi mã nguồn theo hướng:
 *   useStore(s => s.currentUser)   → useAuth()
 *   useStore(s => s.cart)          → useCart() hoặc useCartQuery()
 *   useStore(s => s.wishlist)      → useWishlist()
 */
export { useAuthStore } from "@/infrastructure/state/auth.store";
export { useCartStore } from "@/infrastructure/state/cart.store";
export { useWishlistStore } from "@/infrastructure/state/wishlist.store";
