import { describe, it, expect } from 'vitest'

import { formatCurrency, formatNumber, formatDate } from '../format'

describe('Format Utilities', () => {
    describe('formatCurrency', () => {
        it('should format VND correctly by default', () => {
            expect(formatCurrency(100000)).toBe('100.000\u00A0\u20AB')
        })

        it('should handle zero', () => {
            expect(formatCurrency(0)).toBe('0\u00A0\u20AB')
        })

        it('should handle large numbers', () => {
            expect(formatCurrency(1000000000)).toBe('1.000.000.000\u00A0\u20AB')
        })

        it('should allow custom currency', () => {
            const result = formatCurrency(50, 'USD')
            expect(result).toContain('$')
            expect(result).toContain('50')
        })

        it('should handle string input', () => {
            expect(formatCurrency('25000000')).toContain('25.000.000')
        })

        it('should handle null/undefined', () => {
            expect(formatCurrency(null)).toContain('0')
            expect(formatCurrency(undefined)).toContain('0')
        })

        it('should handle NaN', () => {
            expect(formatCurrency(NaN)).toContain('0')
        })
    })

    describe('formatNumber', () => {
        it('should format numbers with thousands separator', () => {
            expect(formatNumber(1234)).toBe('1.234')
            expect(formatNumber(1000000)).toBe('1.000.000')
        })

        it('should handle zero', () => {
            expect(formatNumber(0)).toBe('0')
        })

        it('should handle string input', () => {
            expect(formatNumber('1234')).toBe('1.234')
        })

        it('should handle null/undefined', () => {
            expect(formatNumber(null)).toBe('0')
            expect(formatNumber(undefined)).toBe('0')
        })
    })

    describe('formatDate', () => {
        it('should format basic date string', () => {
            const date = new Date('2024-01-01T12:00:00Z')
            expect(formatDate(date.toISOString())).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
        })

        it('should handle Date object', () => {
            const date = new Date(2024, 0, 15)
            expect(formatDate(date)).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
        })

        it('should return empty string for null/undefined', () => {
            expect(formatDate(null)).toBe('')
            expect(formatDate(undefined)).toBe('')
        })

        it('should return empty string for invalid date', () => {
            expect(formatDate('invalid-date')).toBe('')
        })
    })
})
