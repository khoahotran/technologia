import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { StarRating } from '../star-rating'

describe('StarRating Component', () => {
    it('should render correct number of stars', () => {
        render(<StarRating rating={3} max={5} />)
        // Lucide React renders SVGs. We can find them by class or SVG structure.
        // Assuming implementation renders SVG elements.
        const stars = document.querySelectorAll('svg.lucide-star')
        expect(stars).toHaveLength(5)
    })

    it('should display rating number if showValue is true', () => {
        render(<StarRating rating={4.5} showValue />)
        expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('should call onRatingChange when clicked and interactive', () => {
        const handleChange = vi.fn()
        render(<StarRating rating={0} interactive onRatingChange={handleChange} />)

        const stars = document.querySelectorAll('svg.lucide-star')
        // Click 3rd star
        if (stars[2]) fireEvent.click(stars[2])

        expect(handleChange).toHaveBeenCalledWith(3)
    })

    it('should NOT call onRatingChange when NOT interactive', () => {
        const handleChange = vi.fn()
        render(<StarRating rating={0} onRatingChange={handleChange} />) // interactive default false

        const stars = document.querySelectorAll('svg.lucide-star')
        if (stars[2]) fireEvent.click(stars[2])

        expect(handleChange).not.toHaveBeenCalled()
    })

    it('should apply custom colors', () => {
        render(<StarRating rating={5} filledColor="text-red-500" />)
        const star = document.querySelector('svg.lucide-star')
        expect(star).toHaveClass('text-red-500')
    })
})
