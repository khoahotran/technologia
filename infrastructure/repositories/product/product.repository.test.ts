import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductRepository } from './product.repository';
import { httpClient } from '@/infrastructure/http/client';
import { ProductEntitySchema } from '@/domain/product/entities/product.entity';

// Mock httpClient
vi.mock('@/infrastructure/http/client', () => ({
    httpClient: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('ProductRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all products and return entities', async () => {
        const mockData = [
            {
                id: '1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                productId: '1',
                name: 'Test Product',
                price: { amount: 100, currency: 'USD' },
                description: 'Test Desc',
            },
        ];

        (httpClient.get as any).mockResolvedValue({ data: mockData });

        const result = await ProductRepository.getAll();

        expect(httpClient.get).toHaveBeenCalledWith('/products');
        expect(result).toHaveLength(1);
        expect(result[0]?.name).toBe('Test Product');
        expect(result[0]?.price.amount).toBe(100);
    });

    it('should create a product', async () => {
        const newProduct = {
            name: 'New Product',
            price: { amount: 200, currency: 'USD' },
        };
        const responseData = { ...newProduct, productId: '2', description: '' };

        (httpClient.post as any).mockResolvedValue({ data: responseData });

        const result = await ProductRepository.create(newProduct as any);

        expect(httpClient.post).toHaveBeenCalledWith('/products', newProduct);
        expect(result.productId).toBe('2');
    });
});
