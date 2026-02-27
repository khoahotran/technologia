import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'

import { useAuth } from '../use-auth.hook'

import { AuthProvider } from '@/shared/providers/auth.provider'

const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
)
Wrapper.displayName = 'UseAuthTestWrapper'

describe('useAuth hook', () => {
    it('should throw when used outside AuthProvider', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { })
        expect(() => renderHook(() => useAuth())).toThrow(
            'useAuth must be used within AuthProvider'
        )
        spy.mockRestore()
    })

    it('should return context when used inside AuthProvider', () => {
        const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
        expect(typeof result.current.login).toBe('function')
        expect(typeof result.current.logout).toBe('function')
    })

    it('should update state after login', () => {
        const mockUser = { userId: 1, username: 'tester', email: 'test@test.com', role: 'USER' }
        const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

        act(() => {
            result.current.login('access-token', 'refresh-token', mockUser)
        })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.token).toBe('access-token')
        expect(result.current.user?.username).toBe('tester')
    })

    it('should clear state after logout', () => {
        const mockUser = { userId: 1, username: 'tester', email: 'test@test.com', role: 'USER' }
        const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

        act(() => {
            result.current.login('access-token', 'refresh-token', mockUser)
        })
        expect(result.current.isAuthenticated).toBe(true)

        act(() => {
            result.current.logout()
        })
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.token).toBeNull()
        expect(result.current.user).toBeNull()
    })
})
