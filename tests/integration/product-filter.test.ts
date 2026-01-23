import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductRepository } from '../../infrastructure/repositories/product/product.repository';
import { BrandRepository } from '../../infrastructure/repositories/product/brand.repository';
import { CategoryRepository } from '../../infrastructure/repositories/product/category.repository';
import { httpClient } from '../../infrastructure/http/client';

// Mock Axios
vi.mock('../../infrastructure/http/client', () => {
    return {
        httpClient: {
            get: vi.fn(),
            defaults: { headers: { common: {} } },
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() }
            }
        },
    };
});

describe('Product Scope 2 Integration (Filter & Search)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Brand Repository', () => {
        it('should fetch all brands', async () => {
            const mockBrands = [{ brandId: 1, name: 'Brand A' }, { brandId: 2, name: 'Brand B' }];
            (httpClient.get as any).mockResolvedValue({ data: mockBrands });

            const brands = await BrandRepository.getAll();
            expect(httpClient.get).toHaveBeenCalledWith('/brands');
            expect(brands).toHaveLength(2);
            expect(brands[0].name).toBe('Brand A');
        });

        it('should fetch paging brands', async () => {
            const mockResponse = {
                status: 200,
                page_number: 0,
                page_size: 10,
                count_items: 2,
                count_pages: 1,
                data: [{ brandId: 1, name: 'Brand A' }],
                message: 'OK'
            };
            (httpClient.get as any).mockResolvedValue({ data: mockResponse });

            const result = await BrandRepository.getPaged(0, 10);
            expect(httpClient.get).toHaveBeenCalledWith('/brands/paged', {
                params: { page: 0, size: 10, sortBy: 'id', sortDirection: 'DESC' }
            });
            expect(result.data).toHaveLength(1);
        });
    });

    describe('Category Repository', () => {
        it('should fetch all categories', async () => {
            const mockCats = [{ categoryId: 10, name: 'Smartphones' }];
            (httpClient.get as any).mockResolvedValue({ data: mockCats });

            const cats = await CategoryRepository.getAll();
            expect(httpClient.get).toHaveBeenCalledWith('/categories');
            expect(cats[0].name).toBe('Smartphones');
        });
    });

    describe('Product Repository Search & Filter', () => {
        it('should call search-filter with correct params', async () => {
            const mockResponse = {
                status: 200,
                page_number: 0,
                page_size: 10,
                count_items: 1,
                count_pages: 1,
                data: [{
                    productId: 101,
                    name: 'Filtered Product',
                    displayPrice: 500,
                    status: 'AVAILABLE',
                    variants: [],
                    brand: 'Brand A',
                    category: 'Cat B'
                }],
                message: 'Success'
            };
            (httpClient.get as any).mockResolvedValue({ data: mockResponse });

            const params = {
                page: 1,
                size: 20,
                keyword: 'phone',
                minPrice: 100,
                brandId: 5
            };

            const result = await ProductRepository.searchAndFilter(params);

            expect(httpClient.get).toHaveBeenCalledWith('/products/search-filter', {
                params: {
                    page: 1,
                    size: 20,
                    sortBy: 'createdAt',
                    sortDirection: 'DESC',
                    keyword: 'phone',
                    minPrice: 100,
                    brandId: 5,
                    maxPrice: undefined,
                    minRating: undefined,
                    maxRating: undefined,
                    categoryId: undefined
                }
            });

            expect(result.data[0].name).toBe('Filtered Product');
        });
    });
});
