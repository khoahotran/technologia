 
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'

import { CartSummary } from '../CartSummary'

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, asChild, disabled, ...props }: any) => {
        if (asChild) {
            return children
        }
        return (
            <button disabled={disabled} {...props} data-testid="button">
                {children}
            </button>
        )
    },
}))

vi.mock('@/providers/language.provider', () => ({
    useLanguage: () => ({
        t: (key: string, _params?: object, fallback?: string) => fallback || key,
        locale: 'vi',
    }),
}))

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href} data-testid="link">
            {children}
        </a>
    ),
}))

describe('CartSummary Component', () => {
    const mockProps = {
        total: 50000000,
        itemCount: 3,
    }

    it('should render total amount correctly', () => {
        render(<CartSummary {...mockProps} />)
        const prices = screen.getAllByText(/50\.000\.000/)
        expect(prices.length).toBeGreaterThan(0)
        expect(prices[0]).toBeInTheDocument()
    })

    it('should render item count', () => {
        render(<CartSummary {...mockProps} />)
        expect(screen.getByText(/3 products/)).toBeInTheDocument()
    })

    it('should render order summary title', () => {
        render(<CartSummary {...mockProps} />)
        expect(screen.getByText('TÓM TẮT ĐƠN HÀNG')).toBeInTheDocument()
    })

    it('should render enabled checkout button when items selected', () => {
        render(<CartSummary {...mockProps} disableCheckout={false} />)
        expect(screen.getByTestId('link')).toBeInTheDocument()
    })

    it('should render disabled checkout button when no items selected', () => {
        render(<CartSummary total={0} itemCount={0} disableCheckout={true} />)
        const button = screen.getByTestId('button')
        expect(button).toHaveAttribute('disabled')
    })

    it('should use custom checkout href when provided', () => {
        const mockPropsWithHref = {
            total: 50000000,
            itemCount: 3,
            checkoutHref: '/custom-checkout',
        }
        render(<CartSummary {...mockPropsWithHref} />)
        expect(screen.getByText('Checkout')).toBeInTheDocument()
    })

    it('should display "Selected 0 products" when itemCount is 0', () => {
        render(<CartSummary total={0} itemCount={0} />)
        const textElement = screen.getByText(/Selected 0 products/)
        expect(textElement).toBeInTheDocument()
    })
})