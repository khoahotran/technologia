import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceDisplay } from '../price-display'

describe('PriceDisplay Component', () => {
    it('should render the current price', () => {
        render(<PriceDisplay price={150000} />)
        expect(screen.getByText(/150/)).toBeInTheDocument()
    })

    it('should accept price as a string', () => {
        render(<PriceDisplay price="250000" />)
        expect(screen.getByText(/250/)).toBeInTheDocument()
    })

    it('should show original price with strikethrough when discount exists', () => {
        render(<PriceDisplay price={100000} originalPrice={200000} />)
        // Both prices should appear
        const spans = document.querySelectorAll('span')
        const strikethroughSpan = Array.from(spans).find(s =>
            s.className.includes('line-through')
        )
        expect(strikethroughSpan).toBeDefined()
        expect(strikethroughSpan?.textContent).toContain('200')
    })

    it('should hide original price when no discount', () => {
        render(<PriceDisplay price={200000} originalPrice={100000} />)
        // originalPrice <= price → no discount
        const spans = document.querySelectorAll('span')
        const strikethroughSpan = Array.from(spans).find(s =>
            s.className.includes('line-through')
        )
        expect(strikethroughSpan).toBeUndefined()
    })

    it('should show discount percentage badge when showDiscountPercent=true', () => {
        render(<PriceDisplay price={80000} originalPrice={100000} showDiscountPercent />)
        expect(screen.getByText(/-20%/)).toBeInTheDocument()
    })

    it('should not show discount badge when showDiscountPercent=false (default)', () => {
        render(<PriceDisplay price={80000} originalPrice={100000} />)
        expect(screen.queryByText(/-20%/)).not.toBeInTheDocument()
    })
})
