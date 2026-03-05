import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { useCartStore } from '../cart.store'

// Mock Product data
const mockProduct = {
    id: 'p1',
    name: 'Test Product',
    price: 100000,
    image: 'test.jpg',
    rating: 4.5,
    reviewCount: 10,
    category: 'Test',
    brand: 'TestBrand',
    description: 'Desc',
    specifications: {},
    inStock: true,
    sku: 'SKU1'
}

describe('Cart Store', () => {
    beforeEach(() => {
        // Reset store before each test
        act(() => {
            useCartStore.setState({ items: [], isLoading: false })
            useCartStore.persist.clearStorage()
        })
    })

    it('should verify initial empty state', () => {
        const { result } = renderHook(() => useCartStore())
        expect(result.current.items).toEqual([])
        expect(result.current.getItemCount()).toBe(0)
    })

    it('should add item to cart', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(mockProduct, 1)
        })

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0]!.productId).toBe('p1')
        expect(result.current.items[0]!.quantity).toBe(1)
    })

    it('should increase quantity if item exists', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(mockProduct, 1)
            result.current.addItem(mockProduct, 2)
        })

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0]!.quantity).toBe(3)
    })

    it('should remove item', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(mockProduct, 1)
            result.current.removeItem('p1')
        })

        expect(result.current.items).toHaveLength(0)
    })

    it('should update quantity', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(mockProduct, 1)
            result.current.updateQuantity('p1', 5)
        })

        expect(result.current.items[0]!.quantity).toBe(5)
    })

    it('should calculate total correctly', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(mockProduct, 2)
        })

        expect(result.current.getTotal()).toBe(200000)
    })

    it('should clear cart', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(mockProduct, 1)
            result.current.clearCart()
        })

        expect(result.current.items).toHaveLength(0)
    })
})
