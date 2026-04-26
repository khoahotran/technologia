import { describe, it, expect } from 'vitest'

import { toErrorMessage, isSessionExpiredError } from '../error-message'

import { AppError } from '@/api/client'

describe('toErrorMessage Utility', () => {
    describe('AppError handling', () => {
        it('should return AppError message when error is AppError', () => {
            const error = new AppError('Session expired', 401, 'UNAUTHORIZED')
            expect(toErrorMessage(error)).toBe('Session expired')
        })

        it('should return AppError message with different status codes', () => {
            const error500 = new AppError('Internal Server Error', 500)
            expect(toErrorMessage(error500)).toBe('Internal Server Error')

            const error403 = new AppError('Forbidden', 403, 'FORBIDDEN')
            expect(toErrorMessage(error403)).toBe('Forbidden')

            const error404 = new AppError('Not Found', 404, 'NOT_FOUND')
            expect(toErrorMessage(error404)).toBe('Not Found')
        })
    })

    describe('Standard Error handling', () => {
        it('should return Error message when error is standard Error', () => {
            const error = new Error('Something went wrong')
            expect(toErrorMessage(error)).toBe('Something went wrong')
        })

        it('should return fallback for unknown error types', () => {
            expect(toErrorMessage('string error', 'Custom fallback')).toBe('Custom fallback')
            expect(toErrorMessage(123, 'Custom fallback')).toBe('Custom fallback')
            expect(toErrorMessage(null, 'Custom fallback')).toBe('Custom fallback')
            expect(toErrorMessage(undefined, 'Custom fallback')).toBe('Custom fallback')
        })

        it('should return default fallback when not provided', () => {
            expect(toErrorMessage('string error')).toBe('Request failed')
            expect(toErrorMessage(123)).toBe('Request failed')
            expect(toErrorMessage(null)).toBe('Request failed')
        })
    })
})

describe('isSessionExpiredError Utility', () => {
    describe('Session expired detection', () => {
        it('should return true for 401 AppError', () => {
            const error = new AppError('Session expired', 401, 'UNAUTHORIZED')
            expect(isSessionExpiredError(error)).toBe(true)
        })

        it('should return false for non-401 AppError', () => {
            const error403 = new AppError('Forbidden', 403)
            expect(isSessionExpiredError(error403)).toBe(false)

            const error500 = new AppError('Server error', 500)
            expect(isSessionExpiredError(error500)).toBe(false)

            const error404 = new AppError('Not found', 404)
            expect(isSessionExpiredError(error404)).toBe(false)
        })

        it('should return false for standard Error', () => {
            const error = new Error('Session expired')
            expect(isSessionExpiredError(error)).toBe(false)
        })

        it('should return false for unknown types', () => {
            expect(isSessionExpiredError(null)).toBe(false)
            expect(isSessionExpiredError(undefined)).toBe(false)
            expect(isSessionExpiredError('string')).toBe(false)
            expect(isSessionExpiredError(123)).toBe(false)
        })
    })
})