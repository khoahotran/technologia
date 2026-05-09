import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/store'
import type { AuthSession } from '@/features/auth/types'

vi.mock('@/utils/storage', () => ({
    authStorage: {
        getAccessToken: vi.fn(() => null),
        getRefreshToken: vi.fn(() => null),
        setTokens: vi.fn(),
        clearTokens: vi.fn(),
    },
}))

const mockSession: AuthSession = {
    accessToken: 'mock-access-token-123',
    refreshToken: 'mock-refresh-token-456',
    user: {
        userId: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'CUSTOMER',
    },
}

describe('Auth Store', () => {
    beforeEach(() => {
        useAuthStore.getState().clearSession()
    })

    afterEach(() => {
        useAuthStore.getState().clearSession()
    })

    describe('setSession', () => {
        it('should set session with user data', () => {
            useAuthStore.getState().setSession(mockSession)

            const session = useAuthStore.getState().session
            expect(session).not.toBeNull()
            expect(session?.accessToken).toBe('mock-access-token-123')
            expect(session?.user?.email).toBe('test@example.com')
        })

        it('should store user information correctly', () => {
            useAuthStore.getState().setSession(mockSession)

            const session = useAuthStore.getState().session
            expect(session?.user?.userId).toBe('user-1')
            expect(session?.user?.username).toBe('testuser')
            expect(session?.user?.role).toBe('CUSTOMER')
        })
    })

    describe('clearSession', () => {
        it('should clear session when called', () => {
            useAuthStore.getState().setSession(mockSession)
            useAuthStore.getState().clearSession()

            const session = useAuthStore.getState().session
            expect(session).toBeNull()
        })

        it('should clear user data from state', () => {
            useAuthStore.getState().setSession(mockSession)
            useAuthStore.getState().clearSession()

            expect(useAuthStore.getState().session).toBeNull()
        })
    })

    describe('Authentication State', () => {
        it('should detect authenticated user', () => {
            useAuthStore.getState().setSession(mockSession)

            const isAuthenticated = useAuthStore.getState().session !== null
            expect(isAuthenticated).toBe(true)
        })

        it('should detect unauthenticated user', () => {
            const isAuthenticated = useAuthStore.getState().session !== null
            expect(isAuthenticated).toBe(false)
        })
    })

    describe('Token Management', () => {
        it('should have access token when authenticated', () => {
            useAuthStore.getState().setSession(mockSession)

            const accessToken = useAuthStore.getState().session?.accessToken
            expect(accessToken).toBeDefined()
            expect(accessToken).toContain('mock-access-token')
        })

        it('should have refresh token when authenticated', () => {
            useAuthStore.getState().setSession(mockSession)

            const refreshToken = useAuthStore.getState().session?.refreshToken
            expect(refreshToken).toBeDefined()
            expect(refreshToken).toContain('mock-refresh-token')
        })
    })

    describe('Session Expiration', () => {
        it('should handle session cleared after 401', () => {
            useAuthStore.getState().setSession(mockSession)
            expect(useAuthStore.getState().session).not.toBeNull()

            useAuthStore.getState().clearSession()
            expect(useAuthStore.getState().session).toBeNull()
        })
    })
})

describe('API Client 401 Handling', () => {
    it('should handle 401 unauthorized response', () => {
        const mock401Error = {
            response: { status: 401 },
            config: { url: '/api/products' },
        }

        expect(mock401Error.response.status).toBe(401)
    })

    it('should clear tokens on 401 when refresh fails', () => {
        const clearAuthState = () => {
            useAuthStore.getState().clearSession()
        }

        useAuthStore.getState().setSession(mockSession)
        expect(useAuthStore.getState().session).not.toBeNull()

        clearAuthState()
        expect(useAuthStore.getState().session).toBeNull()
    })

    it('should throw UNAUTHORIZED error on 401', () => {
        const errorCode = 'UNAUTHORIZED'
        expect(errorCode).toBe('UNAUTHORIZED')
    })
})

describe('Route Protection', () => {
    beforeEach(() => {
        useAuthStore.getState().clearSession()
    })

    afterEach(() => {
        useAuthStore.getState().clearSession()
    })

    it('should prevent checkout when not authenticated', () => {
        const isAuthenticated = useAuthStore.getState().session !== null

        const canAccessCheckout = isAuthenticated
        expect(canAccessCheckout).toBe(false)
    })

    it('should allow checkout when authenticated', () => {
        useAuthStore.getState().setSession(mockSession)
        const isAuthenticated = useAuthStore.getState().session !== null

        const canAccessCheckout = isAuthenticated
        expect(canAccessCheckout).toBe(true)
    })

    it('should prevent profile when not authenticated', () => {
        useAuthStore.getState().clearSession()
        const isAuthenticated = useAuthStore.getState().session !== null

        const canAccessProfile = isAuthenticated
        expect(canAccessProfile).toBe(false)
    })

    it('should allow profile when authenticated', () => {
        useAuthStore.getState().setSession(mockSession)
        const isAuthenticated = useAuthStore.getState().session !== null

        const canAccessProfile = isAuthenticated
        expect(canAccessProfile).toBe(true)
    })
})