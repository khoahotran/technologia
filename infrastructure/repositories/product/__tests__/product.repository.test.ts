import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductRepository } from '../product.repository'
import { httpClient } from '@/infrastructure/http/client'

// Mock httpClient
vi.mock('@/infrastructure/http/client', () => ({
    httpClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }
}))

describe('ProductRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getPaged', () => {
        it('should fetch paginated products', async () => {
            const mockResponse = {
                status: 200,
                page_number: 1,
                page_size: 10,
                count_items: 5,
                count_pages: 1,
                data: [
                    {
                        productId: 'p1',
                        name: 'Product 1',
                        slug: 'p1',
                        status: 'ACTIVE',
                        isVisible: true,
                        totalStock: 10,
                        displayPrice: 100,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                message: 'Success'
            }

            vi.mocked(httpClient.get).mockResolvedValue({ data: mockResponse })

            const result = await ProductRepository.getPaged(1, 10, 'name', 'ASC')

            expect(httpClient.get).toHaveBeenCalledWith('/products/paged', {
                params: { page: 1, size: 10, sortBy: 'name', sortDirection: 'ASC' }
            })
            expect(result.data).toHaveLength(1)
            expect(result.data?.[0]?.name).toBe('Product 1')
        })
    })

    describe('searchAndFilter', () => {
        it('should map complex filter parameters correctly', async () => {
            const mockResponse = {
                status: 200,
                page_number: 0,
                page_size: 20,
                count_items: 1,
                count_pages: 1,
                data: [
                    {
                        productId: 'p2',
                        name: 'Filtered Product',
                        slug: 'p2',
                        status: 'ACTIVE',
                        isVisible: true,
                        totalStock: 5,
                        displayPrice: 50,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                message: 'Success'
            }

            vi.mocked(httpClient.get).mockResolvedValue({ data: mockResponse })

            const params = {
                page: 0,
                size: 20,
                minPrice: 10,
                maxPrice: 100,
                keyword: 'Filter',
                categoryId: 1
            }

            const result = await ProductRepository.searchAndFilter(params)

            expect(httpClient.get).toHaveBeenCalledWith('/products/search-filter', {
                params: {
                    page: 0,
                    size: 20,
                    sortBy: 'createdAt', // fallback logic
                    sortDirection: 'DESC', // fallback logic
                    minPrice: 10,
                    maxPrice: 100,
                    keyword: 'Filter',
                    categoryId: 1,
                    brandId: undefined, // undefined are passed through
                    minRating: undefined,
                    maxRating: undefined,
                }
            })
            expect(result.data).toHaveLength(1)
            expect(result.data?.[0]?.name).toBe('Filtered Product')
        })
    })
})
