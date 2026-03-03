/**
 * Extended Cart Store Edge Cases
 * Tests the business logic paths that would break silently:
 * - updateQuantity(0) must remove the item (not leave qty=0)
 * - getItemCount across multiple unique products
 * - getTotal with multiple products at different prices
 * - removeItem for a non-existent ID (safety)
 */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { useCartStore } from '../cart.store'

const product1 = {
    id: 'p1', name: 'Phone', price: 500000,
    image: 'p1.jpg', rating: 4, reviewCount: 5,
    category: 'Electronics', brand: 'A', description: '', specifications: {}, inStock: true, sku: 'S1'
}

const product2 = {
    id: 'p2', name: 'Case', price: 50000,
    image: 'p2.jpg', rating: 5, reviewCount: 2,
    category: 'Accessories', brand: 'B', description: '', specifications: {}, inStock: true, sku: 'S2'
}

describe('Cart Store — Edge Cases', () => {
    beforeEach(() => {
        act(() => {
            useCartStore.setState({ items: [], isLoading: false })
            useCartStore.persist.clearStorage()
        })
    })

    it('updateQuantity(0) should remove the item entirely', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(product1, 3)
            result.current.updateQuantity('p1', 0)
        })

        // quantity 0 or below → item should be removed
        expect(result.current.items).toHaveLength(0)
    })

    it('updateQuantity(negative) should remove the item', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(product1, 2)
            result.current.updateQuantity('p1', -1)
        })

        expect(result.current.items).toHaveLength(0)
    })

    it('getItemCount should sum quantities across multiple products', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(product1, 2)
            result.current.addItem(product2, 3)
        })

        expect(result.current.getItemCount()).toBe(5)
    })

    it('getTotal should account for multiple products at different prices', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(product1, 2) // 2 × 500,000 = 1,000,000
            result.current.addItem(product2, 3) // 3 ×  50,000 =   150,000
        })

        expect(result.current.getTotal()).toBe(1150000)
    })

    it('removeItem on non-existent id should leave cart unchanged', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(product1, 1)
            result.current.removeItem('does-not-exist')
        })

        expect(result.current.items).toHaveLength(1)
    })

    it('clearCart should zero out getTotal and getItemCount', () => {
        const { result } = renderHook(() => useCartStore())

        act(() => {
            result.current.addItem(product1, 5)
            result.current.clearCart()
        })

        expect(result.current.getTotal()).toBe(0)
        expect(result.current.getItemCount()).toBe(0)
    })
})
