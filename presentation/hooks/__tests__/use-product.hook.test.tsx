import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock ProductRepository before importing hooks
vi.mock('@/infrastructure/repositories/product/product.repository', () => ({
    ProductRepository: {
        searchAndFilter: vi.fn(),
        getById: vi.fn(),
        getAll: vi.fn(),
        getPaged: vi.fn(),
    }
}))

import { useProductList, productKeys } from '../use-product'
import { ProductRepository } from '@/infrastructure/repositories/product/product.repository'

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, staleTime: 0 },
        },
    })
    const Wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    Wrapper.displayName = 'UseProductHookTestWrapper'
    return Wrapper
}

describe('useProductList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch with default params when no params are provided', async () => {
        const mockData = {
            data: [{ productId: '1', name: 'Product 1' }],
            page_number: 0,
            status: 200,
            page_size: 10,
            count_items: 1,
            count_pages: 1,
            message: 'OK'
        }
        ;(ProductRepository.searchAndFilter as any).mockResolvedValue(mockData)

        const { result } = renderHook(() => useProductList(), { wrapper: createWrapper() })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(ProductRepository.searchAndFilter).toHaveBeenCalled()
        expect(result.current.products).toHaveLength(1)
        expect(result.current.products[0].name).toBe('Product 1')
    })

    it('should fetch data when params are provided', async () => {
        const mockData = {
            data: [{ productId: '1', name: 'Product 1' }],
            page_number: 0,
            status: 200,
            page_size: 10,
            count_items: 1,
            count_pages: 1,
            message: 'OK'
        }
        ;(ProductRepository.searchAndFilter as any).mockResolvedValue(mockData)

        const params = { page: 0, size: 12, search: 'test' }
        const { result } = renderHook(() => useProductList(params), { wrapper: createWrapper() })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(ProductRepository.searchAndFilter).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 0,
                size: 12,
                keyword: 'test'
            })
        )

        expect(result.current.products).toHaveLength(1)
        expect(result.current.products[0].name).toBe('Product 1')
    })
})
