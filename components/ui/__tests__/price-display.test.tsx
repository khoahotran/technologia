import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceDisplay } from '../price-display'

describe('PriceDisplay Component', () => {
    it('should format current price correctly', () => {
        render(<PriceDisplay price={150000} />)
        // Adjust regex or expected string based on format logic (nbsp)
        expect(screen.getByText(/150.000/)).toBeInTheDocument()
    })

    it('should show original price if present and greater', () => {
        render(<PriceDisplay price={100000} originalPrice={150000} />)
        expect(screen.getByText(/150.000/)).toHaveClass('line-through')
        expect(screen.getByText(/100.000/)).not.toHaveClass('line-through')
    })

    it('should NOT show original price if smaller or equal', () => {
        render(<PriceDisplay price={100000} originalPrice={90000} />)
        expect(screen.queryByText(/90.000/)).not.toBeInTheDocument()
    })

    it('should show discount percent badge if enabled', () => {
        // 100k vs 200k = 50% discount
        render(<PriceDisplay price={100000} originalPrice={200000} showDiscountPercent />)
        expect(screen.getByText('-50%')).toBeInTheDocument()
    })

    it('should handle string inputs', () => {
        render(<PriceDisplay price="100000" originalPrice="200000" showDiscountPercent />)
        expect(screen.getByText('-50%')).toBeInTheDocument()
    })
})
