import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProductList, useProductDetail } from '../use-products'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductRepository } from '@/infrastructure/repositories/product/product.repository'

// Mock the repository
vi.mock('@/infrastructure/repositories/product/product.repository', () => ({
    ProductRepository: {
        searchAndFilter: vi.fn(),
        getById: vi.fn(),
    }
}))

// Wrapper for React Query
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('Product Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('useProductList', () => {
        it('should fetch products successfully', async () => {
            const mockData = {
                data: [{ productId: 'p1', name: 'P1' }],
                count_pages: 1,
                count_items: 1,
                page_number: 0
            }

            vi.mocked(ProductRepository.searchAndFilter).mockResolvedValue(mockData as any)

            const { result } = renderHook(() => useProductList({}), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(result.current.isFetching).toBe(false))

            expect(result.current.products).toHaveLength(1)
            expect(result.current.products[0].productId).toBe('p1')
            expect(ProductRepository.searchAndFilter).toHaveBeenCalled()
        })

        it('should handle errors', async () => {
            vi.mocked(ProductRepository.searchAndFilter).mockRejectedValue(new Error('Failed'))

            const { result } = renderHook(() => useProductList({}), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toBeDefined()
        })
    })

    describe('useProductDetail', () => {
        it('should fetch product detail', async () => {
            const mockProduct = { productId: 'p1', name: 'Detail P1' }
            vi.mocked(ProductRepository.getById).mockResolvedValue(mockProduct as any)

            const { result } = renderHook(() => useProductDetail('p1'), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.product?.name).toBe('Detail P1')
            expect(ProductRepository.getById).toHaveBeenCalledWith('p1')
        })
    })
})
