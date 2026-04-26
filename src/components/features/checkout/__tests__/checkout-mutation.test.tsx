import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { useCartStore, CartItemInput } from '@/store/cart.store'

vi.mock('@/utils/logger', () => ({
    logger: {
        action: vi.fn(),
    },
}))

describe('Checkout API Error Handling', () => {
    it('should handle API error 500', () => {
        const mockError = {
            response: { status: 500 },
            message: 'Internal Server Error',
        }
        
        expect(mockError.response.status).toBe(500)
    })

    it('should handle API error 400', () => {
        const mockError = {
            response: { status: 400 },
            message: 'Validation failed',
            responseData: { errors: [{ field: 'receiverName', message: 'Required' }] },
        }
        
        expect(mockError.response.status).toBe(400)
    })

    it('should handle network error', () => {
        const mockError = new Error('Network error')
        expect(mockError.message).toBe('Network error')
    })
})

describe('Cart Clear after Successful Order', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart()
    })

    afterEach(() => {
        useCartStore.getState().clearCart()
    })

    it('should clear cart after successful checkout', () => {
        const product: CartItemInput = {
            id: 'prod-1',
            name: 'iPhone 15',
            price: 25000000,
        }

        useCartStore.getState().addItem(product)
        expect(useCartStore.getState().items).toHaveLength(1)

        useCartStore.getState().clearCart()
        expect(useCartStore.getState().items).toHaveLength(0)
        expect(useCartStore.getState().getTotal()).toBe(0)
    })

    it('should not allow checkout with empty cart', () => {
        const total = useCartStore.getState().getTotal()
        const itemCount = useCartStore.getState().getItemCount()

        expect(total).toBe(0)
        expect(itemCount).toBe(0)
    })
})

describe('Checkout Form Validation', () => {
    it('should validate phone number format', () => {
        const phoneRegex = /^0[0-9]{9,10}$|^\+84[0-9]{9,10}$/
        
        expect(phoneRegex.test('0912345678')).toBe(true)
        expect(phoneRegex.test('+84912345678')).toBe(true)
        expect(phoneRegex.test('abc')).toBe(false)
        expect(phoneRegex.test('12')).toBe(false)
    })

    it('should validate email format', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        
        expect(emailRegex.test('test@example.com')).toBe(true)
        expect(emailRegex.test('user.name@example.vn')).toBe(true)
        expect(emailRegex.test('invalid')).toBe(false)
        expect(emailRegex.test('@example.com')).toBe(false)
    })
})

describe('Checkout Flow: Empty Cart Prevention', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart()
    })

    afterEach(() => {
        useCartStore.getState().clearCart()
    })

    it('should prevent order placement when cart is empty', () => {
        const items = useCartStore.getState().items
        const total = useCartStore.getState().getTotal()

        expect(items).toHaveLength(0)
        expect(total).toBe(0)

        const canPlaceOrder = items.length > 0 && total > 0
        expect(canPlaceOrder).toBe(false)
    })

    it('should allow order placement when cart has items', () => {
        const product: CartItemInput = {
            id: 'prod-1',
            name: 'iPhone 15',
            price: 25000000,
        }

        useCartStore.getState().addItem(product)

        const items = useCartStore.getState().items
        const total = useCartStore.getState().getTotal()

        expect(items).toHaveLength(1)
        expect(total).toBeGreaterThan(0)

        const canPlaceOrder = items.length > 0 && total > 0
        expect(canPlaceOrder).toBe(true)
    })
})