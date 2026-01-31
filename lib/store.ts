import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
    Product, Category, Review, Address, Order, OrderItem
} from './mock-data';
import {
    products as initialProducts,
    categories as initialCategories,
    reviews as initialReviews,
    addresses as initialAddresses,
    orders as initialOrders
} from './mock-data'

type CartItem = OrderItem

interface UserState {
    currentUser: { name: string; email: string; avatar: string } | null
    isAuthenticated: boolean
    login: (email: string) => void
    logout: () => void
}

interface DataState {
    products: Product[]
    categories: Category[]
    reviews: Review[]
    addresses: Address[]
    orders: Order[]
    cart: CartItem[]
    wishlist: string[] // product IDs

    // Actions
    addToCart: (product: Product, quantity?: number) => void
    removeFromCart: (productId: string) => void
    updateCartQuantity: (productId: string, quantity: number) => void
    clearCart: () => void

    addAddress: (address: Omit<Address, 'id'>) => void
    updateAddress: (id: string, address: Partial<Address>) => void
    deleteAddress: (id: string) => void
    setDefaultAddress: (id: string) => void

    placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void

    toggleWishlist: (productId: string) => void
}

export const useStore = create<DataState & UserState>()(
    persist<DataState & UserState>(
        (set) => ({
            // Initial Data
            products: initialProducts,
            categories: initialCategories,
            reviews: initialReviews,
            addresses: initialAddresses,
            orders: initialOrders,
            cart: [],
            wishlist: [],
            currentUser: { name: "Demo User", email: "demo@example.com", avatar: "https://github.com/shadcn.png" }, // Default logged in for demo
            isAuthenticated: true,

            // User Actions
            login: (email) => set({ isAuthenticated: true, currentUser: { name: "User", email, avatar: "" } }),
            logout: () => set({ isAuthenticated: false, currentUser: null }),

            // Cart Actions
            addToCart: (product, quantity = 1) => set((state) => {
                const existing = state.cart.find(item => item.productId === product.id)
                if (existing) {
                    return {
                        cart: state.cart.map(item =>
                            item.productId === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        )
                    }
                }
                return {
                    cart: [...state.cart, {
                        productId: product.id,
                        productName: product.name,
                        price: product.price,
                        image: product.image,
                        quantity
                    }]
                }
            }),
            removeFromCart: (productId) => set((state) => ({
                cart: state.cart.filter(item => item.productId !== productId)
            })),
            updateCartQuantity: (productId, quantity) => set((state) => ({
                cart: state.cart.map(item =>
                    item.productId === productId ? { ...item, quantity } : item
                )
            })),
            clearCart: () => set({ cart: [] }),

            // Address Actions
            addAddress: (address) => set((state) => ({
                addresses: [...state.addresses, { ...address, id: crypto.randomUUID(), isDefault: state.addresses.length === 0 }]
            })),
            updateAddress: (id, updates) => set((state) => ({
                addresses: state.addresses.map(addr => addr.id === id ? { ...addr, ...updates } : addr)
            })),
            deleteAddress: (id) => set((state) => ({
                addresses: state.addresses.filter(addr => addr.id !== id)
            })),
            setDefaultAddress: (id) => set((state) => ({
                addresses: state.addresses.map(addr => ({ ...addr, isDefault: addr.id === id }))
            })),

            // Order Actions
            placeOrder: (orderData) => set((state) => ({
                orders: [{
                    ...orderData,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'created',
                }, ...state.orders],
                cart: [] // Clear cart after order
            })),

            // Wishlist
            toggleWishlist: (productId) => set((state) => {
                const isIn = state.wishlist.includes(productId)
                return {
                    wishlist: isIn
                        ? state.wishlist.filter(id => id !== productId)
                        : [...state.wishlist, productId]
                }
            })
        }),
        {
            name: 'shop-storage', // unique name
        }
    ) as unknown as StateCreator<DataState & UserState>
)
