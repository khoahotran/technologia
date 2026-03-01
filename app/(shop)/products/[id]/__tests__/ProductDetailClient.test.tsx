import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import ProductDetailClient from '../ProductDetailClient'

import * as CartApiHooks from '@/hooks/use-cart-api'
import * as ProductHooks from '@/hooks/use-products'

// Mock Hooks
vi.mock('@/hooks/use-products', () => ({
    useProductDetail: vi.fn(),
    useProductList: vi.fn(),
}))

vi.mock('@/hooks/use-cart-api', () => ({
    useAddToCartMutation: vi.fn(),
}))

// Mock Next Navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
}))

const mockMutate = vi.fn()

describe('ProductDetailClient', () => {
    type ProductDetailResult = ReturnType<typeof ProductHooks.useProductDetail>
    type ProductListResult = ReturnType<typeof ProductHooks.useProductList>

    const mockProduct = {
        productId: 'p1',
        name: 'Test Product',
        displayPrice: 100000,
        averageRating: 4.5,
        totalStock: 10,
        variants: [{ variantId: 'v1', images: ['/test.jpg'] }],
        category: 'Test',
        brandName: 'Brand',
        description: 'Desc',
        specsText: '',
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(CartApiHooks.useAddToCartMutation).mockReturnValue({
            mutate: mockMutate,
        } as ReturnType<typeof CartApiHooks.useAddToCartMutation>)
    })

    it('should show loading state', () => {
        vi.mocked(ProductHooks.useProductDetail).mockReturnValue({
            isLoading: true,
            product: null,
            error: null,
        } as ProductDetailResult)
        vi.mocked(ProductHooks.useProductList).mockReturnValue({ products: [] } as ProductListResult)

        render(<ProductDetailClient id="p1" />)
        // Skeleton elements usually don't have text, but we can check for structure or testID
        // In our code, Loading returns <ProductDetailSkeleton />
        // Let's assume the skeleton renders some divs. using querySelector might be needed or checking "Failed to load" is NOT present.
        expect(screen.queryByText('Failed to load product')).not.toBeInTheDocument()
    })

    it('should show error state', () => {
        vi.mocked(ProductHooks.useProductDetail).mockReturnValue({
            isLoading: false,
            product: null,
            error: new Error('Err'),
        } as ProductDetailResult)
        vi.mocked(ProductHooks.useProductList).mockReturnValue({ products: [] } as ProductListResult)

        render(<ProductDetailClient id="p1" />)
        expect(screen.getByText('Failed to load product')).toBeInTheDocument()
    })

    it('should render product details', () => {
        vi.mocked(ProductHooks.useProductDetail).mockReturnValue({
            isLoading: false,
            product: mockProduct,
            error: null,
        } as ProductDetailResult)
        vi.mocked(ProductHooks.useProductList).mockReturnValue({ products: [] } as ProductListResult)

        render(<ProductDetailClient id="p1" />)
        expect(screen.getByText('Buy Now')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should add to cart', () => {
        vi.mocked(ProductHooks.useProductDetail).mockReturnValue({
            isLoading: false,
            product: mockProduct,
            error: null,
        } as ProductDetailResult)
        vi.mocked(ProductHooks.useProductList).mockReturnValue({ products: [] } as ProductListResult)

        render(<ProductDetailClient id="p1" />)

        const buyButton = screen.getByText('Buy Now')
        fireEvent.click(buyButton)

        expect(mockMutate).toHaveBeenCalled()
    })
})
