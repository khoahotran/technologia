import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ProductCard } from '../product-card'

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))

describe('ProductCard Component', () => {
    const mockRouter = { push: vi.fn() }

    beforeEach(() => {
        vi.mocked(useRouter).mockReturnValue(
            mockRouter as unknown as ReturnType<typeof useRouter>
        )
        mockRouter.push.mockClear()
    })

    const defaultProps = {
        id: 'p1',
        title: 'Test Product',
        price: '100.000',
        image: '/test.jpg',
        rating: 4.5,
    }

    it('should render product info correctly', () => {
        render(<ProductCard {...defaultProps} />)
        expect(screen.getByText('Test Product')).toBeInTheDocument()
        expect(screen.getByText('100.000')).toBeInTheDocument()
        expect(screen.getByAltText('Test Product')).toBeInTheDocument()
    })

    it('should navigate to details page on click', () => {
        render(<ProductCard {...defaultProps} />)
        fireEvent.click(screen.getByText('Details'))
        expect(mockRouter.push).toHaveBeenCalledWith('/products/p1')
    })

    it('should render badge if provided', () => {
        render(<ProductCard {...defaultProps} badge="New" />)
        expect(screen.getByText('New')).toBeInTheDocument()
    })
})
