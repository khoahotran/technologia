import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetAllBrands = vi.fn()
vi.mock('@/application/use-cases/brand/use-brand', () => ({
    useBrand: () => ({ getAll: mockGetAllBrands })
}))

const mockGetAllCategories = vi.fn()
vi.mock('@/application/use-cases/category/use-category', () => ({
    useCategory: () => ({ getAll: mockGetAllCategories })
}))

import { useBrandHook } from '../use-brand.hook'
import { useCategoryHook } from '../use-category.hook'

const createWrapper = () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
}

describe('useBrandHook', () => {
    it('should fetch brands and expose them via brandsQuery', async () => {
        mockGetAllBrands.mockResolvedValue([{ id: 1, name: 'Apple' }])

        const { result } = renderHook(() => useBrandHook(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.brandsQuery.isSuccess).toBe(true))
        expect(result.current.brandsQuery.data).toHaveLength(1)
        expect(result.current.brandsQuery.data?.[0].name).toBe('Apple')
    })

    it('should expose error state when fetch fails', async () => {
        mockGetAllBrands.mockRejectedValue(new Error('network error'))

        const { result } = renderHook(() => useBrandHook(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.brandsQuery.isError).toBe(true))
    })
})

describe('useCategoryHook', () => {
    it('should fetch categories and expose them via categoriesQuery', async () => {
        mockGetAllCategories.mockResolvedValue([{ id: 10, name: 'Phones' }])

        const { result } = renderHook(() => useCategoryHook(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.categoriesQuery.isSuccess).toBe(true))
        expect(result.current.categoriesQuery.data?.[0].name).toBe('Phones')
    })

    it('should expose error state when fetch fails', async () => {
        mockGetAllCategories.mockRejectedValue(new Error('network error'))

        const { result } = renderHook(() => useCategoryHook(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.categoriesQuery.isError).toBe(true))
    })
})
