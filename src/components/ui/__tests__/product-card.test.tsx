import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ProductCard } from '../product-card'

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: { children: React.ReactNode }) => (
        <span data-testid="badge">{children}</span>
    ),
}))

vi.mock('@/components/ui/star-rating', () => ({
    StarRating: ({ rating }: { rating: number }) => (
        <div data-testid="star-rating">{rating}</div>
    ),
}))

vi.mock('@/providers/language.provider', () => ({
    useLanguage: () => ({
        t: (key: string, _params?: object, fallback?: string) => fallback || key,
        locale: 'vi',
    }),
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

    it('should navigate to details page on Details button click', () => {
        render(<ProductCard {...defaultProps} />)
        fireEvent.click(screen.getByRole('button', { name: 'Details' }))
        expect(mockRouter.push).toHaveBeenCalledWith('/products/p1')
    })

    it('should render badge if provided', () => {
        render(<ProductCard {...defaultProps} badge="New" />)
        expect(screen.getByTestId('badge')).toBeInTheDocument()
        expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should call onAddToCart when add to cart button is clicked', () => {
        const onAddToCart = vi.fn()
        render(<ProductCard {...defaultProps} onAddToCart={onAddToCart} />)
        
        const addToCartBtn = screen.getByRole('button', { name: /add_to_cart_aria/i })
        fireEvent.click(addToCartBtn)
        
        expect(onAddToCart).toHaveBeenCalledTimes(1)
    })

    it('should render rating', () => {
        render(<ProductCard {...defaultProps} rating={4} />)
        expect(screen.getByTestId('star-rating')).toBeInTheDocument()
    })

    it('should render product card in compact variant', () => {
        render(<ProductCard {...defaultProps} variant="compact" />)
        expect(screen.getByText('Test Product')).toBeInTheDocument()
    })

    it('should render selectable variant with checkbox', () => {
        const onSelect = vi.fn()
        render(<ProductCard {...defaultProps} variant="selectable" onSelect={onSelect} />)
        
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()
    })
})
