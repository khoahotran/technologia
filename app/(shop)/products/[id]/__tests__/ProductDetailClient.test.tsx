import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import ProductDetailClient from '../ProductDetailClient'

import * as PresentationHooks from '@/presentation/hooks'

// Mock Hooks
vi.mock('@/presentation/hooks', () => ({
    useProductDetail: vi.fn(),
    useProductList: vi.fn(),
    useAddToCartMutation: vi.fn(),
}))

// Mock Next Navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}))

const mockMutate = vi.fn()

describe('ProductDetailClient', () => {
    const mockProduct = {
        productId: 'p1',
        name: 'Test Product',
        displayPrice: 100000,
        averageRating: 4.5,
        totalStock: 10,
        variants: [{ variantId: 'v1', images: ['/test.jpg'] }],
        category: { name: 'Test' },
        brandName: 'Brand',
        description: 'Desc',
        specsText: '',
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(PresentationHooks.useAddToCartMutation).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as any)
    })

    it('should show loading state', () => {
        vi.mocked(PresentationHooks.useProductDetail).mockReturnValue({
            isLoading: true,
            product: null,
            error: null,
        } as any)
        vi.mocked(PresentationHooks.useProductList).mockReturnValue({ products: [] } as any)

        render(<ProductDetailClient id="p1" />)
        expect(screen.queryByText('Failed to load product')).not.toBeInTheDocument()
    })

    it('should show error state', () => {
        vi.mocked(PresentationHooks.useProductDetail).mockReturnValue({
            isLoading: false,
            product: null,
            error: new Error('Err'),
        } as any)
        vi.mocked(PresentationHooks.useProductList).mockReturnValue({ products: [] } as any)

        render(<ProductDetailClient id="p1" />)
        expect(screen.getByText('Không tải được sản phẩm')).toBeInTheDocument()
    })

    it('should render product details', () => {
        vi.mocked(PresentationHooks.useProductDetail).mockReturnValue({
            isLoading: false,
            product: mockProduct,
            error: null,
        } as any)
        vi.mocked(PresentationHooks.useProductList).mockReturnValue({ products: [] } as any)

        render(<ProductDetailClient id="p1" />)
        expect(screen.getByText('Buy now')).toBeInTheDocument()
        expect(screen.getByText('Chi tiết')).toBeInTheDocument()
    })

    it('should add to cart', () => {
        vi.mocked(PresentationHooks.useProductDetail).mockReturnValue({
            isLoading: false,
            product: mockProduct,
            error: null,
        } as any)
        vi.mocked(PresentationHooks.useProductList).mockReturnValue({ products: [] } as any)

        render(<ProductDetailClient id="p1" />)

        const buyButton = screen.getByText('Buy now')
        fireEvent.click(buyButton)

        expect(mockMutate).toHaveBeenCalled()
    })
})
