import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ProductRepository } from '../product.repository'

import { fetchWithToken } from '@/infrastructure/http'

// Mock fetchWithToken
vi.mock('@/infrastructure/http', () => ({
    fetchWithToken: vi.fn(),
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
                        status: 'AVAILABLE',
                        totalStock: 10,
                        displayPrice: 100,
                        variants: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                message: 'Get products successfully'
            }

            vi.mocked(fetchWithToken).mockResolvedValue(mockResponse)

            const result = await ProductRepository.getPaged(1, 10, 'create_at', 'ASC')

            expect(fetchWithToken).toHaveBeenCalledWith('/products/paged', {
                method: 'GET',
                query: { page: '1', size: '10', sortBy: 'create_at', sortDirection: 'ASC' }
            })
            expect(result.data).toHaveLength(1)
            expect(result.data![0]!.name).toBe('Product 1')
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
                message: 'Filter products successfully',
                data: [
                    {
                        productId: 'p2',
                        name: 'Filtered Product',
                        description: 'A filtered product',
                        status: 'AVAILABLE',
                        totalStock: 5,
                        displayPrice: 50,
                        variants: [],
                        specsText: '',
                        brand: 'Brand A',
                        category: 'Electronics',
                        averageRating: 4.5,
                        minPrice: 45,
                        maxPrice: 55,
                        minRating: null,
                        maxRating: null,
                        sortBy: 'create_at',
                        sortOrder: 'DESC'
                    }
                ]
            }

            vi.mocked(fetchWithToken).mockResolvedValue(mockResponse)

            const params = {
                page: 0,
                size: 20,
                minPrice: 10,
                maxPrice: 100,
                keyword: 'Filter',
                categoryId: 1
            }

            const result = await ProductRepository.searchAndFilter(params)

            expect(fetchWithToken).toHaveBeenCalledWith('/products/search-filter', {
                method: 'GET',
                query: {
                    page: '0',
                    size: '20',
                    sortBy: 'create_at',
                    sortDirection: 'DESC',
                    minPrice: '10',
                    maxPrice: '100',
                    keyword: 'Filter',
                    categoryId: '1',
                }
            })
            expect(result.data).toHaveLength(1)
            expect(result.data![0]!.name).toBe('Filtered Product')
        })
    })

    it('should handle product getById', async () => {
        const mockProduct = {
            productId: 'p1',
            name: 'Product Name',
            status: 'AVAILABLE',
            totalStock: 10,
            displayPrice: 100,
            variants: [],
            description: 'A product',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        vi.mocked(fetchWithToken).mockResolvedValue({
            status: 200,
            message: 'Get product successfully',
            data: mockProduct
        })

        const result = await ProductRepository.getById('p1')

        expect(fetchWithToken).toHaveBeenCalledWith('/products/p1', { method: 'GET' })
        expect(result.name).toBe('Product Name')
        expect(result.productId).toBe('p1')
    })
})
