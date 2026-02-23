import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, AuthContext } from '@/shared/providers/auth.provider'
import { useAuth } from '../use-auth.hook'
import { useContext } from 'react'

describe('useAuth hook', () => {
    it('should throw when used outside AuthProvider', () => {
        // Suppress console.error for this expected throw
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { })
        expect(() => renderHook(() => useAuth())).toThrow(
            'useAuth must be used within AuthProvider'
        )
        spy.mockRestore()
    })

    it('should return context when used inside AuthProvider', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
        })

        expect(result.current).toBeDefined()
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
        expect(typeof result.current.login).toBe('function')
        expect(typeof result.current.logout).toBe('function')
    })
})

describe('AuthProvider', () => {
    it('should update state after login', async () => {
        const mockUser = { userId: 1, username: 'tester', email: 'test@test.com', role: 'USER' }

        let contextValue: ReturnType<typeof useAuth> | undefined

        function Consumer() {
            contextValue = useAuth()
            return null
        }

        render(
            <AuthProvider>
                <Consumer />
            </AuthProvider>
        )

        expect(contextValue?.isAuthenticated).toBe(false)

        act(() => {
            contextValue?.login('access-token', 'refresh-token', mockUser)
        })

        expect(contextValue?.isAuthenticated).toBe(true)
        expect(contextValue?.token).toBe('access-token')
        expect(contextValue?.user?.username).toBe('tester')
    })

    it('should clear state after logout', () => {
        const mockUser = { userId: 1, username: 'tester', email: 'test@test.com', role: 'USER' }

        let contextValue: ReturnType<typeof useAuth> | undefined

        function Consumer() {
            contextValue = useAuth()
            return null
        }

        render(
            <AuthProvider>
                <Consumer />
            </AuthProvider>
        )

        act(() => {
            contextValue?.login('access-token', 'refresh-token', mockUser)
        })
        expect(contextValue?.isAuthenticated).toBe(true)

        act(() => {
            contextValue?.logout()
        })
        expect(contextValue?.isAuthenticated).toBe(false)
        expect(contextValue?.token).toBeNull()
        expect(contextValue?.user).toBeNull()
    })
})
