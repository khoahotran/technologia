import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/constants', () => ({
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
    },
}))

vi.mock('@/utils/result', () => ({
    safeSync: vi.fn((fn: () => unknown) => {
        try {
            return [fn(), null]
        } catch (e) {
            return [null, e]
        }
    }),
}))

const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}

beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('localStorage', mockLocalStorage)
})

import { storage, authStorage } from '../storage'

describe('Storage Service', () => {
    describe('storage.set()', () => {
        it('should store string value directly', () => {
            mockLocalStorage.getItem.mockReturnValue(null)
            storage.set('key', 'value')
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', 'value')
        })

        it('should stringify object value', () => {
            mockLocalStorage.getItem.mockReturnValue(null)
            storage.set('key', { name: 'test' })
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', '{"name":"test"}')
        })
    })

    describe('storage.get()', () => {
        it('should return raw string value', () => {
            mockLocalStorage.getItem.mockReturnValue('plain string')
            const result = storage.get('key')
            expect(result).toBe('plain string')
        })

        it('should parse JSON object', () => {
            mockLocalStorage.getItem.mockReturnValue('{"name":"test"}')
            const result = storage.get('key')
            expect(result).toEqual({ name: 'test' })
        })

        it('should parse JSON array', () => {
            mockLocalStorage.getItem.mockReturnValue('["a","b"]')
            const result = storage.get('key')
            expect(result).toEqual(['a', 'b'])
        })

        it('should return original value when JSON parse fails', () => {
            mockLocalStorage.getItem.mockReturnValue('{invalid}')
            const result = storage.get('key')
            expect(result).toBe('{invalid}')
        })

        it('should return null when key not found', () => {
            mockLocalStorage.getItem.mockReturnValue(null)
            const result = storage.get('nonexistent')
            expect(result).toBe(null)
        })

        it('should return boolean true', () => {
            mockLocalStorage.getItem.mockReturnValue('true')
            const result = storage.get('key')
            expect(result).toBe(true)
        })

        it('should return boolean false', () => {
            mockLocalStorage.getItem.mockReturnValue('false')
            const result = storage.get('key')
            expect(result).toBe(false)
        })
    })

    describe('storage.remove()', () => {
        it('should remove item from storage', () => {
            storage.remove('key')
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key')
        })
    })

    describe('storage.clear()', () => {
        it('should clear all storage', () => {
            storage.clear()
            expect(mockLocalStorage.clear).toHaveBeenCalled()
        })
    })

    describe('authStorage', () => {
        it('should get access token', () => {
            mockLocalStorage.getItem.mockReturnValue('token123')
            const result = authStorage.getAccessToken()
            expect(result).toBe('token123')
        })

        it('should set tokens', () => {
            mockLocalStorage.getItem.mockReturnValue(null)
            authStorage.setTokens('access', 'refresh')
            expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
        })

        it('should clear tokens', () => {
            authStorage.clearTokens()
            expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2)
        })

        it('should check if tokens exist - true', () => {
            mockLocalStorage.getItem.mockReturnValue('token')
            expect(authStorage.hasTokens()).toBe(true)
        })

        it('should check if tokens exist - false', () => {
            mockLocalStorage.getItem.mockReturnValue(null)
            expect(authStorage.hasTokens()).toBe(false)
        })

        it('should get refresh token', () => {
            mockLocalStorage.getItem.mockReturnValue('refreshToken')
            const result = authStorage.getRefreshToken()
            expect(result).toBe('refreshToken')
        })
    })
})