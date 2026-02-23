import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Must mock the use-cases/product before importing the hook
const mockSearchAndFilter = vi.fn()
vi.mock('@/application/use-cases/product', () => ({
    useProduct: () => ({
        searchAndFilter: mockSearchAndFilter
    })
}))

import { useProductHook } from '../use-product.hook'

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, staleTime: 0 },
        },
    })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('useProductHook', () => {
    it('should skip query if no params are provided initially, or fetch if params are provided', async () => {
        const { result } = renderHook(() => useProductHook(), { wrapper: createWrapper() })

        // enabled: !!params means it's disabled if params are not provided
        expect(result.current.pagedProductsQuery.fetchStatus).toBe('idle')
    })

    it('should fetch data when params are provided', async () => {
        mockSearchAndFilter.mockResolvedValue({
            data: [{ id: '1', name: 'Product 1' }],
            page_number: 0,
            status: 200,
            page_size: 10,
            count_items: 1,
            count_pages: 1,
            message: 'OK'
        })

        const params = { page: 0, size: 12, keyword: 'test' }
        const { result } = renderHook(() => useProductHook(params), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.pagedProductsQuery.isSuccess).toBe(true))

        expect(mockSearchAndFilter).toHaveBeenCalledWith(expect.objectContaining({
            page: 0,
            size: 12,
            keyword: 'test'
        }))

        expect(result.current.pagedProductsQuery.data?.data[0].name).toBe('Product 1')
    })
})
