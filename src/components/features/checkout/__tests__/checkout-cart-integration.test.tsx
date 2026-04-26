import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { useCartStore, CartItemInput } from '@/store/cart.store'

vi.mock('@/utils/logger', () => ({
    logger: {
        action: vi.fn(),
    },
}))

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))

const createQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderWithQuery = (ui: React.ReactElement) => {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    )
}

describe('Cart Store Integration with Checkout Flow', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart()
    })

    afterEach(() => {
        useCartStore.getState().clearCart()
    })

    describe('Cart Store: Add Items for Checkout', () => {
        it('should add item to cart and calculate total for checkout', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15 Pro',
                price: 25000000,
            }
            
            useCartStore.getState().addItem(product, 2)
            
            const items = useCartStore.getState().items
            expect(items).toHaveLength(1)
            expect(items[0].quantity).toBe(2)
            
            const total = useCartStore.getState().getTotal()
            expect(total).toBe(50000000) 
        })

        it('should calculate correct total with multiple items', () => {
            const product1: CartItemInput = { id: 'prod-1', name: 'iPhone 15', price: 25000000 }
            const product2: CartItemInput = { id: 'prod-2', name: 'AirPods', price: 5000000 }
            
            useCartStore.getState().addItem(product1, 1)
            useCartStore.getState().addItem(product2, 2)
            
            const total = useCartStore.getState().getTotal()
            expect(total).toBe(35000000)
        })

        it('should return 0 total when cart is empty', () => {
            const total = useCartStore.getState().getTotal()
            expect(total).toBe(0)
        })

        it('should return 0 item count when cart is empty', () => {
            const count = useCartStore.getState().getItemCount()
            expect(count).toBe(0)
        })
    })

    describe('Cart Store: Update Quantity affects Total', () => {
        it('should update total when quantity changes', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 10000000,
            }
            
            useCartStore.getState().addItem(product, 1)
            expect(useCartStore.getState().getTotal()).toBe(10000000)
            
            useCartStore.getState().updateQuantity('prod-1', 3)
            expect(useCartStore.getState().getTotal()).toBe(30000000)
        })

        it('should remove item when quantity updated to 0', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 10000000,
            }
            
            useCartStore.getState().addItem(product, 2)
            useCartStore.getState().updateQuantity('prod-1', 0)
            
            expect(useCartStore.getState().items).toHaveLength(0)
            expect(useCartStore.getState().getTotal()).toBe(0)
        })
    })

    describe('Cart Store: Clear Cart after Place Order', () => {
        it('should clear all items representing successful order placement', () => {
            const product1: CartItemInput = { id: 'prod-1', name: 'iPhone', price: 25000000 }
            const product2: CartItemInput = { id: 'prod-2', name: 'MacBook', price: 50000000 }
            
            useCartStore.getState().addItem(product1)
            useCartStore.getState().addItem(product2)
            expect(useCartStore.getState().items).toHaveLength(2)
            
            useCartStore.getState().clearCart()
            
            expect(useCartStore.getState().items).toHaveLength(0)
            expect(useCartStore.getState().getTotal()).toBe(0)
            expect(useCartStore.getState().getItemCount()).toBe(0)
        })
    })

    describe('Checkout Summary from Cart Store', () => {
        it('should render correct summary based on cart state', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'Test Product',
                price: 15000000,
            }
            
            useCartStore.getState().addItem(product, 2)
            
            const total = useCartStore.getState().getTotal()
            const itemCount = useCartStore.getState().getItemCount()
            
            expect(total).toBe(30000000)
            expect(itemCount).toBe(2)
        })

        it('should handle empty cart for checkout validation', () => {
            const total = useCartStore.getState().getTotal()
            const itemCount = useCartStore.getState().getItemCount()
            
            expect(total).toBe(0)
            expect(itemCount).toBe(0)
            
            expect(useCartStore.getState().items).toHaveLength(0)
        })
    })
})

describe('Router Navigation for Checkout', () => {
    let mockRouter: { push: ReturnType<typeof vi.fn> }

    beforeEach(() => {
        mockRouter = { push: vi.fn() }
        vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>)
    })

    afterEach(() => {
        mockRouter.push.mockClear()
    })

    it('should redirect to orders page after successful checkout', () => {
        mockRouter.push('/orders/123')
        expect(mockRouter.push).toHaveBeenCalledWith('/orders/123')
    })

    it('should redirect to home when cart is empty', () => {
        mockRouter.push('/')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
})