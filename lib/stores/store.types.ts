/**
 * Store Types
 *
 * Centralized type definitions for Zustand stores.
 * Provides type safety for all store slices.
 */

import type { Product, Address, Order, OrderItem } from "@/lib/mock-data";

// ===========================================
// Auth Store Types
// ===========================================

export interface UserProfile {
    userId: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    imageUrl?: string;
    displayName?: string;
    role?: string;
}

export interface AuthState {
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthActions {
    setUser: (user: UserProfile) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

// ===========================================
// Cart Store Types
// ===========================================

export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    image?: string;
    quantity: number;
    variantId?: string;
    variantName?: string;
}

export interface CartState {
    items: CartItem[];
    isLoading: boolean;
}

export interface CartActions {
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export type CartStore = CartState & CartActions;

// ===========================================
// Wishlist Store Types
// ===========================================

export interface WishlistState {
    items: string[]; // Product IDs
}

export interface WishlistActions {
    toggle: (productId: string) => void;
    add: (productId: string) => void;
    remove: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clear: () => void;
}

export type WishlistStore = WishlistState & WishlistActions;

// ===========================================
// Address Store Types
// ===========================================

export interface AddressState {
    addresses: Address[];
}

export interface AddressActions {
    addAddress: (address: Omit<Address, "id">) => void;
    updateAddress: (id: string, address: Partial<Address>) => void;
    deleteAddress: (id: string) => void;
    setDefaultAddress: (id: string) => void;
    getDefaultAddress: () => Address | undefined;
}

export type AddressStore = AddressState & AddressActions;

// ===========================================
// Order Store Types
// ===========================================

export interface CreateOrderPayload {
    items: OrderItem[];
    shippingAddressId: string;
    paymentMethod: string;
    notes?: string;
}

export interface OrderState {
    orders: Order[];
    isLoading: boolean;
}

export interface OrderActions {
    placeOrder: (payload: CreateOrderPayload) => void;
    getOrderById: (id: string) => Order | undefined;
}

export type OrderStore = OrderState & OrderActions;

// ===========================================
// Combined Store Types (Legacy Support)
// ===========================================

export interface LegacyStoreState {
    // Auth
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    // Cart
    cartItems: CartItem[];
    // Wishlist
    wishlistItems: string[];
    // Other
    products: Product[];
    categories: unknown[];
    reviews: unknown[];
    addresses: Address[];
    orders: Order[];
}
