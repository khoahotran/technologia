import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useAuthStore } from '../auth.store'

// Mock Logger
vi.mock('@/lib/logger', () => ({
    logger: {
        action: vi.fn(),
        info: vi.fn(),
    }
}))

describe('Auth Store', () => {
    beforeEach(() => {
        act(() => {
            useAuthStore.setState({
                currentUser: null,
                isAuthenticated: false,
                isLoading: false
            })
            useAuthStore.persist.clearStorage()
        })
    })

    const mockUser = {
        userId: 'u1',
        username: 'test_user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        avatar: 'avatar.jpg'
    }

    it('should initialize empty', () => {
        const { result } = renderHook(() => useAuthStore())
        expect(result.current.currentUser).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set user (login)', () => {
        const { result } = renderHook(() => useAuthStore())

        act(() => {
            result.current.setUser(mockUser)
        })

        expect(result.current.currentUser).toEqual(mockUser)
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('should clear user (logout)', () => {
        const { result } = renderHook(() => useAuthStore())

        act(() => {
            result.current.setUser(mockUser)
            result.current.clearUser()
        })

        expect(result.current.currentUser).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set loading', () => {
        const { result } = renderHook(() => useAuthStore())

        act(() => {
            result.current.setLoading(true)
        })

        expect(result.current.isLoading).toBe(true)
    })
})
