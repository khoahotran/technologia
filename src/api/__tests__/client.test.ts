import { describe, it, expect } from 'vitest'
import { AppError } from '../client'

describe('API Client - AppError', () => {
    it('should create error with default values', () => {
        const error = new AppError('Test error')
        expect(error.message).toBe('Test error')
        expect(error.statusCode).toBe(500)
        expect(error.code).toBe('UNKNOWN_ERROR')
    })

    it('should create error with custom values', () => {
        const error = new AppError('Test error', 404, 'NOT_FOUND', { details: 'test' })
        expect(error.message).toBe('Test error')
        expect(error.statusCode).toBe(404)
        expect(error.code).toBe('NOT_FOUND')
        expect(error.details).toEqual({ details: 'test' })
    })

    it('should have correct name', () => {
        const error = new AppError('Test error')
        expect(error.name).toBe('AppError')
    })

    it('should be instance of Error', () => {
        const error = new AppError('Test error')
        expect(error).toBeInstanceOf(Error)
    })
})