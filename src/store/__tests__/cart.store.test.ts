import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useCartStore, CartItemInput } from '../cart.store'

vi.mock('@/utils/logger', () => ({
    logger: {
        action: vi.fn(),
    },
}))

describe('Cart Store', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart()
    })

    describe('addItem', () => {
        it('should add new item to cart', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
                image: '/iphone15.jpg',
            }

            useCartStore.getState().addItem(product)

            const items = useCartStore.getState().items
            expect(items).toHaveLength(1)
            expect(items[0]!.productId).toBe('prod-1')
            expect(items[0]!.productName).toBe('iPhone 15')
            expect(items[0]!.price).toBe(25000000)
            expect(items[0]!.quantity).toBe(1)
        })

        it('should add item with custom quantity', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }

            useCartStore.getState().addItem(product, 3)

            const items = useCartStore.getState().items
            expect(items[0]!.quantity).toBe(3)
        })

        it('should increase quantity when adding existing item', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }

            useCartStore.getState().addItem(product, 2)
            useCartStore.getState().addItem(product, 3)

            const items = useCartStore.getState().items
            expect(items).toHaveLength(1)
            expect(items[0]!.quantity).toBe(5)
        })
    })

    describe('removeItem', () => {
        it('should remove item from cart', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }

            useCartStore.getState().addItem(product)
            useCartStore.getState().removeItem('prod-1')

            const items = useCartStore.getState().items
            expect(items).toHaveLength(0)
        })

        it('should not affect other items', () => {
            const product1: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }
            const product2: CartItemInput = {
                id: 'prod-2',
                name: 'MacBook Pro',
                price: 50000000,
            }

            useCartStore.getState().addItem(product1)
            useCartStore.getState().addItem(product2)
            useCartStore.getState().removeItem('prod-1')

            const items = useCartStore.getState().items
            expect(items).toHaveLength(1)
            expect(items[0]!.productId).toBe('prod-2')
        })
    })

    describe('updateQuantity', () => {
        it('should update item quantity', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }

            useCartStore.getState().addItem(product)
            useCartStore.getState().updateQuantity('prod-1', 5)

            const items = useCartStore.getState().items
            expect(items[0]!.quantity).toBe(5)
        })

        it('should remove item when quantity is 0', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }

            useCartStore.getState().addItem(product)
            useCartStore.getState().updateQuantity('prod-1', 0)

            const items = useCartStore.getState().items
            expect(items).toHaveLength(0)
        })

        it('should remove item when quantity is negative', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }

            useCartStore.getState().addItem(product)
            useCartStore.getState().updateQuantity('prod-1', -1)

            const items = useCartStore.getState().items
            expect(items).toHaveLength(0)
        })
    })

    describe('clearCart', () => {
        it('should remove all items from cart', () => {
            const product1: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }
            const product2: CartItemInput = {
                id: 'prod-2',
                name: 'MacBook Pro',
                price: 50000000,
            }

            useCartStore.getState().addItem(product1)
            useCartStore.getState().addItem(product2)
            useCartStore.getState().clearCart()

            const items = useCartStore.getState().items
            expect(items).toHaveLength(0)
        })
    })

    describe('getTotal', () => {
        it('should calculate total correctly', () => {
            const product1: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }
            const product2: CartItemInput = {
                id: 'prod-2',
                name: 'AirPods',
                price: 5000000,
            }

            useCartStore.getState().addItem(product1, 2)
            useCartStore.getState().addItem(product2, 3)

            const total = useCartStore.getState().getTotal()
            expect(total).toBe(65000000)
        })

        it('should return 0 for empty cart', () => {
            const total = useCartStore.getState().getTotal()
            expect(total).toBe(0)
        })
    })

    describe('getItemCount', () => {
        it('should return total quantity of all items', () => {
            const product1: CartItemInput = {
                id: 'prod-1',
                name: 'iPhone 15',
                price: 25000000,
            }
            const product2: CartItemInput = {
                id: 'prod-2',
                name: 'AirPods',
                price: 5000000,
            }

            useCartStore.getState().addItem(product1, 2)
            useCartStore.getState().addItem(product2, 3)

            const count = useCartStore.getState().getItemCount()
            expect(count).toBe(5)
        })

        it('should return 0 for empty cart', () => {
            const count = useCartStore.getState().getItemCount()
            expect(count).toBe(0)
        })
    })
})