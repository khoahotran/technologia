import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'

import { useBrands } from '../use-brand'
import { useCategories } from '../use-category'

import { IBrandRepository } from '@/domain/product/repositories/brand.repository.interface'
import { ICategoryRepository } from '@/domain/product/repositories/category.repository.interface'
import { RepositoryProvider } from '@/shared/providers/repository.provider'


const mockBrandRepository = {
    getAll: vi.fn(),
    getById: vi.fn(),
    getPaged: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getBasePath: vi.fn(),
    getEntitySchema: vi.fn()
}

const mockCategoryRepository = {
    getAll: vi.fn(),
    getById: vi.fn(),
    getPaged: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getBasePath: vi.fn(),
    getEntitySchema: vi.fn()
}

const createWrapper = () => {
    const qc = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            }
        }
    })

    const Wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>
            <RepositoryProvider mockRepositories={{
                brandRepository: mockBrandRepository as unknown as IBrandRepository,
                categoryRepository: mockCategoryRepository as unknown as ICategoryRepository
            }}>
                {children}
            </RepositoryProvider>
        </QueryClientProvider>
    )
    Wrapper.displayName = 'UseBrandCategoryTestWrapper'
    return Wrapper
}

describe('useBrands', () => {
    it('should fetch brands', async () => {
        const mockData = [{ brandId: 1, name: 'Apple' }]
        mockBrandRepository.getAll.mockResolvedValue(mockData)

        const { result } = renderHook(() => useBrands(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockData)
        expect(result.current.data?.[0]?.brandId).toBe(1)
    })

    it('should expose error state when fetch fails', async () => {
        mockBrandRepository.getAll.mockRejectedValue(new Error('network error'))

        const { result } = renderHook(() => useBrands(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.isError).toBe(true))
    })
})

describe('useCategories', () => {
    it('should fetch categories', async () => {
        const mockData = [{ categoryId: 10, name: 'Phones' }]
        mockCategoryRepository.getAll.mockResolvedValue(mockData)

        const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockData)
        expect(result.current.data?.[0]?.categoryId).toBe(10)
    })

    it('should expose error state when fetch fails', async () => {
        mockCategoryRepository.getAll.mockRejectedValue(new Error('network error'))

        const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.isError).toBe(true))
    })
})
