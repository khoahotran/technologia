import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { useWishlistStore } from '../wishlist.store'

describe('Wishlist Store', () => {
    beforeEach(() => {
        act(() => {
            useWishlistStore.setState({ items: [] })
            useWishlistStore.persist.clearStorage()
        })
    })

    it('should initialize empty', () => {
        const { result } = renderHook(() => useWishlistStore())
        expect(result.current.items).toEqual([])
    })

    it('should add item', () => {
        const { result } = renderHook(() => useWishlistStore())
        act(() => result.current.add('p1'))
        expect(result.current.items).toContain('p1')
    })

    it('should remove item', () => {
        const { result } = renderHook(() => useWishlistStore())
        act(() => {
            result.current.add('p1')
            result.current.remove('p1')
        })
        expect(result.current.items).not.toContain('p1')
    })

    it('should toggle item', () => {
        const { result } = renderHook(() => useWishlistStore())

        // Toggle on
        act(() => result.current.toggle('p1'))
        expect(result.current.items).toContain('p1')
        expect(result.current.isInWishlist('p1')).toBe(true)

        // Toggle off
        act(() => result.current.toggle('p1'))
        expect(result.current.items).not.toContain('p1')
        expect(result.current.isInWishlist('p1')).toBe(false)
    })
})
