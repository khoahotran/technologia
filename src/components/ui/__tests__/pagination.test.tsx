import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from '../pagination'

describe('Pagination Components', () => {
    it('should render the base navigation container', () => {
        render(
            <Pagination>
                <PaginationContent>
                    <PaginationItem>Testing</PaginationItem>
                </PaginationContent>
            </Pagination>
        )
        const nav = screen.getByRole('navigation', { name: /pagination/i })
        expect(nav).toBeInTheDocument()
        expect(screen.getByText('Testing')).toBeInTheDocument()
    })

    it('should render a standard pagination link', () => {
        render(<PaginationLink href="/page/2">2</PaginationLink>)
        const link = screen.getByRole('link', { name: '2' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/page/2')
        expect(link).not.toHaveAttribute('aria-current')
    })

    it('should represent active state correctly', () => {
        render(<PaginationLink href="/page/2" isActive>2</PaginationLink>)
        const link = screen.getByRole('link', { name: '2' })
        expect(link).toHaveAttribute('aria-current', 'page')
    })

    it('should render previous and next buttons', () => {
        render(
            <>
                <PaginationPrevious href="/prev" />
                <PaginationNext href="/next" />
            </>
        )
        const prev = screen.getByRole('link', { name: /về trang trước/i })
        const next = screen.getByRole('link', { name: /sang trang sau/i })
        
        expect(prev).toBeInTheDocument()
        expect(prev).toHaveAttribute('href', '/prev')
        expect(next).toBeInTheDocument()
        expect(next).toHaveAttribute('href', '/next')
    })

    it('should render ellipsis', () => {
        render(<PaginationEllipsis />)
        const ellipsisText = screen.getByText('Thêm trang khác')
        expect(ellipsisText).toBeInTheDocument()
        expect(ellipsisText).toHaveClass('sr-only') // Ensures accessibility text is hidden
    })
})
