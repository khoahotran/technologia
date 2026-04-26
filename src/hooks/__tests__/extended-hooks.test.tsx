import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { usePagination, useDebounce } from '../'

import { useCartStore, CartItemInput } from '@/store/cart.store'

vi.mock('@/utils/logger', () => ({
    logger: { action: vi.fn() },
}))

describe('Custom Hooks - Extended Coverage', () => {

    describe('usePagination', () => {
        beforeEach(() => {
            useCartStore.getState().clearCart()
        })

        afterEach(() => {
            useCartStore.getState().clearCart()
        })

        it('should initialize with default values', () => {
            const { result } = renderHook(() => usePagination())
            expect(result.current.page).toBe(0)
            expect(result.current.size).toBe(10)
            expect(result.current.sortBy).toBe('createdAt')
            expect(result.current.sortDirection).toBe('DESC')
        })

        it('should initialize with custom options', () => {
            const { result } = renderHook(() => usePagination({
                initialPage: 2,
                initialSize: 20,
                initialSortBy: 'name',
                initialSortDirection: 'ASC',
            }))
            expect(result.current.page).toBe(2)
            expect(result.current.size).toBe(20)
            expect(result.current.sortBy).toBe('name')
            expect(result.current.sortDirection).toBe('ASC')
        })

        it('should set page correctly', () => {
            const { result } = renderHook(() => usePagination())
            act(() => result.current.setPage(5))
            expect(result.current.page).toBe(5)
        })

        it('should set size and reset page to 0', () => {
            const { result } = renderHook(() => usePagination())
            act(() => result.current.setPage(5))
            expect(result.current.page).toBe(5)

            act(() => result.current.setSize(20))
            expect(result.current.size).toBe(20)
            expect(result.current.page).toBe(0)
        })

        it('should set sort by and reset page to 0', () => {
            const { result } = renderHook(() => usePagination())
            act(() => result.current.setPage(3))
            expect(result.current.page).toBe(3)

            act(() => result.current.setSortBy('price'))
            expect(result.current.sortBy).toBe('price')
            expect(result.current.page).toBe(0)
        })

        it('should set sort direction', () => {
            const { result } = renderHook(() => usePagination())
            act(() => result.current.setSortDirection('ASC'))
            expect(result.current.sortDirection).toBe('ASC')
        })

        it('should toggle sort direction', () => {
            const { result } = renderHook(() => usePagination())
            expect(result.current.sortDirection).toBe('DESC')

            act(() => result.current.toggleSortDirection())
            expect(result.current.sortDirection).toBe('ASC')

            act(() => result.current.toggleSortDirection())
            expect(result.current.sortDirection).toBe('DESC')
        })

        it('should reset to initial state', () => {
            const { result } = renderHook(() => usePagination({
                initialPage: 1,
                initialSize: 20,
            }))

            act(() => result.current.setPage(10))
            expect(result.current.page).toBe(10)

            act(() => result.current.reset())
            expect(result.current.page).toBe(1)
            expect(result.current.size).toBe(20)
        })
    })

    describe('useDebounce', () => {
        it('should return initial value immediately', () => {
            const { result } = renderHook(() => useDebounce('initial', 500))
            expect(result.current).toBe('initial')
        })

        it('should debounce value updates', async () => {
            vi.useFakeTimers()
            const { result, rerender } = renderHook(
                ({ val }: { val: string }) => useDebounce(val, 500),
                { initialProps: { val: 'initial' } }
            )

            expect(result.current).toBe('initial')

            rerender({ val: 'updated' })
            expect(result.current).toBe('initial')

            act(() => vi.advanceTimersByTime(500))
            expect(result.current).toBe('updated')

            vi.useRealTimers()
        })

        it('should cancel previous timer when value changes', async () => {
            vi.useFakeTimers()
            const { result, rerender } = renderHook(
                ({ val }: { val: string }) => useDebounce(val, 500),
                { initialProps: { val: 'first' } }
            )

            rerender({ val: 'second' })
            act(() => vi.advanceTimersByTime(300))
            expect(result.current).toBe('first')

            act(() => vi.advanceTimersByTime(300))
            expect(result.current).toBe('second')

            vi.useRealTimers()
        })

        it('should use default delay of 300ms', () => {
            vi.useFakeTimers()
            const { result, rerender } = renderHook(
                ({ val }: { val: string }) => useDebounce(val),
                { initialProps: { val: 'initial' } }
            )

            rerender({ val: 'updated' })
            act(() => vi.advanceTimersByTime(299))
            expect(result.current).toBe('initial')

            act(() => vi.advanceTimersByTime(1))
            expect(result.current).toBe('updated')

            vi.useRealTimers()
        })

        it('should handle number values', async () => {
            vi.useFakeTimers()
            const { result, rerender } = renderHook(
                ({ val }: { val: number }) => useDebounce(val, 100),
                { initialProps: { val: 0 } }
            )

            expect(result.current).toBe(0)

            rerender({ val: 100 })
            act(() => vi.advanceTimersByTime(100))
            expect(result.current).toBe(100)

            vi.useRealTimers()
        })

        it('should handle object values', async () => {
            vi.useFakeTimers()
            const initialObj = { key: 'value' }
            const updatedObj = { key: 'updated' }

            const { result, rerender } = renderHook(
                ({ val }: { val: object }) => useDebounce(val, 100),
                { initialProps: { val: initialObj } }
            )

            expect(result.current).toEqual(initialObj)

            rerender({ val: updatedObj })
            act(() => vi.advanceTimersByTime(100))
            expect(result.current).toEqual(updatedObj)

            vi.useRealTimers()
        })
    })

    describe('usePagination with Cart Store Integration', () => {
        beforeEach(() => {
            useCartStore.getState().clearCart()
        })

        afterEach(() => {
            useCartStore.getState().clearCart()
        })

        it('should calculate cart total after pagination state update', () => {
            const product: CartItemInput = {
                id: 'prod-1',
                name: 'Test Product',
                price: 10000000,
            }
            useCartStore.getState().addItem(product)

            const total = useCartStore.getState().getTotal()
            expect(total).toBe(10000000)

            useCartStore.getState().updateQuantity('prod-1', 3)
            const updatedTotal = useCartStore.getState().getTotal()
            expect(updatedTotal).toBe(30000000)
        })

        it('should handle empty cart with pagination', () => {
            const total = useCartStore.getState().getTotal()
            const { result } = renderHook(() => usePagination())

            expect(total).toBe(0)
            expect(result.current.page).toBe(0)
        })
    })
})