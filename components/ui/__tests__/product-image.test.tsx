import { render, screen, fireEvent, act } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'
import { describe, it, expect, vi } from 'vitest'

import { ProductImage } from '../product-image'

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ fill: _fill, priority: _priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} />
    }
}))

describe('ProductImage Component', () => {
    it('should show placeholder when no src provided', () => {
        render(<ProductImage alt="Test Alt" />)
        const img = screen.queryByRole('img')
        expect(img).not.toBeInTheDocument()
    })

    it('should render image when src is provided', () => {
        render(<ProductImage src="/test.jpg" alt="Test Alt" />)
        const img = screen.getByRole('img', { name: 'Test Alt' })
        expect(img).toHaveAttribute('src', expect.stringContaining('test.jpg'))
    })

    it('should handle load event (remove loading state)', () => {
        render(<ProductImage src="/test.jpg" alt="Test Alt" />)
        const img = screen.getByRole('img', { name: 'Test Alt' })

        expect(img).toHaveClass('opacity-0')

        act(() => {
            fireEvent.load(img)
        })
        expect(img).not.toHaveClass('opacity-0')
    })

    it('should handle error event (show placeholder)', () => {
        render(<ProductImage src="/invalid.jpg" alt="Test Alt" />)
        const img = screen.getByRole('img', { name: 'Test Alt' })

        act(() => {
            fireEvent.error(img)
        })

        expect(screen.queryByRole('img', { name: 'Test Alt' })).not.toBeInTheDocument()
    })

    it('should support hover zoom', () => {
        render(<ProductImage src="/test.jpg" alt="Test Alt" hoverZoom />)
        const img = screen.getByRole('img')
        expect(img).toHaveClass('group-hover:scale-105')
    })
})
