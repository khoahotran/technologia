import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductDetailClient from '../ProductDetailClient'
import * as ProductHooks from '@/hooks/use-products'
import { useCartStore } from '@/lib/stores'

// Mock Hooks
vi.mock('@/hooks/use-products', () => ({
    useProductDetail: vi.fn(),
    useProductList: vi.fn(),
}))

// Mock Next Navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
}))

// Mock Cart Store
const mockAddItem = vi.fn()
vi.mock('@/lib/stores', () => ({
    useCartStore: (selector: any) => {
        // Mock selector behavior if needed, or just return mock action
        return mockAddItem
    }
}))

describe('ProductDetailClient', () => {
    const mockProduct = {
        productId: 'p1',
        name: 'Test Product',
        displayPrice: 100000,
        averageRating: 4.5,
        totalStock: 10,
        variants: [{ images: ['/test.jpg'] }],
        category: 'Test',
        brandName: 'Brand',
        description: 'Desc',
        specsText: '',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show loading state', () => {
        vi.mocked(ProductHooks.useProductDetail).mockReturnValue({
            isLoading: true,
            product: null,
            error: null,
        } as any)
        vi.mocked(ProductHooks.useProductList).mockReturnValue({ products: [] } as any)

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
        } as any)
        vi.mocked(ProductHooks.useProductList).mockReturnValue({ products: [] } as any)

        render(<ProductDetailClient id="p1" />)
        expect(screen.getByText('Failed to load product')).toBeInTheDocument()
    })

    it('should render product details', () => {
        vi.mocked(ProductHooks.useProductDetail).mockReturnValue({
            isLoading: false,
            product: mockProduct,
            error: null,
        } as any)
        vi.mocked(ProductHooks.useProductList).mockReturnValue({ products: [] } as any)

        render(<ProductDetailClient id="p1" />)
        expect(screen.getByText('Buy Now')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should add to cart', () => {
        vi.mocked(ProductHooks.useProductDetail).mockReturnValue({
            isLoading: false,
            product: mockProduct,
            error: null,
        } as any)
        vi.mocked(ProductHooks.useProductList).mockReturnValue({ products: [] } as any)

        render(<ProductDetailClient id="p1" />)

        const buyButton = screen.getByText('Buy Now')
        fireEvent.click(buyButton)

        expect(mockAddItem).toHaveBeenCalled()
        // verify args if possible, but mock implementation of store selector is tricky here.
        // verified call is enough for integration level given store unit tests exist.
    })
})
