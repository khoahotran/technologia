import { describe, it, expect } from 'vitest'

import { formatCurrency, formatNumber, formatDate } from '../format'

describe('Format Utilities', () => {
    describe('formatCurrency', () => {
        it('should format VND correctly by default', () => {
            expect(formatCurrency(100000)).toBe('100.000\u00A0\u20AB') // \u00A0 is nbsp, \u20AB is dong symbol
        })

        it('should handle zero', () => {
            expect(formatCurrency(0)).toBe('0\u00A0\u20AB')
        })

        it('should handle large numbers', () => {
            expect(formatCurrency(1000000000)).toBe('1.000.000.000\u00A0\u20AB')
        })

        it('should allow custom currency', () => {
            const result = formatCurrency(50, 'USD')
            // Note: Locale output depends on node/browser locale, usually $50.00
            expect(result).toContain('$')
            expect(result).toContain('50')
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
    })

    describe('formatDate', () => {
        it('should format basic date string', () => {
            // Use a fixed date to avoid timezone issues in simple tests, or mock system time
            // This assumption relies on default locale (vi-VN from format.ts)
            const date = new Date('2024-01-01T12:00:00Z')
            // vi-VN usually is DD/MM/YYYY
            expect(formatDate(date.toISOString())).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
        })
    })
})
