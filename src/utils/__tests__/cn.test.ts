import { describe, it, expect } from 'vitest'

import { cn } from '../cn'

describe('cn Utility', () => {
    describe('Basic string classes', () => {
        it('should combine multiple string classes', () => {
            const result = cn('bg-blue-500', 'text-white', 'p-4')
            expect(result).toContain('bg-blue-500')
            expect(result).toContain('text-white')
            expect(result).toContain('p-4')
        })

        it('should handle single string class', () => {
            const result = cn('bg-blue-500')
            expect(result).toBe('bg-blue-500')
        })
    })

    describe('Conditional classes', () => {
        it('should include class when condition is true', () => {
            const isActive = true
            const result = cn('base-class', isActive && 'active-class')
            expect(result).toContain('base-class')
            expect(result).toContain('active-class')
        })

        it('should exclude class when condition is false', () => {
            const isActive = false
            const result = cn('base-class', isActive && 'active-class')
            expect(result).toContain('base-class')
            expect(result).not.toContain('active-class')
        })
    })

    describe('Empty values handling', () => {
        it('should combine classes', () => {
            const result = cn('flex', 'items-center')
            expect(result).toContain('flex')
            expect(result).toContain('items-center')
        })
    })
})