/**
 * lib/utils cn() Unit Tests
 * cn() is used by every single UI component for class merging.
 * If it breaks, the entire UI breaks silently — wrong classes, no errors.
 */
import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn() utility', () => {
    it('should merge simple class strings', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes (falsy values ignored)', () => {
        expect(cn('base', false && 'skip', undefined, null, 'add')).toBe('base add')
    })

    it('should merge Tailwind conflicts — last wins', () => {
        // tailwind-merge resolves conflicts: p-4 and p-2 → only last should survive
        expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('should merge multiple conflicting utilities correctly', () => {
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle object syntax from clsx', () => {
        expect(cn({ active: true, disabled: false })).toBe('active')
    })

    it('should handle array syntax', () => {
        expect(cn(['flex', 'items-center'], 'gap-2')).toBe('flex items-center gap-2')
    })

    it('should return empty string for no input', () => {
        expect(cn()).toBe('')
    })

    it('should handle mixed conditional objects and strings', () => {
        const isActive = true
        const result = cn('btn', { 'btn-active': isActive, 'btn-disabled': false })
        expect(result).toBe('btn btn-active')
    })
})
