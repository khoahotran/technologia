import { describe, it, expect, vi } from 'vitest';
import { getProducts, createBrandAdmin, updateBrandAdmin, createCategoryAdmin } from '../api';
import * as client from '@/api/client';
import { createMockBrand, createMockCategory } from '@/test/factories';

vi.mock('@/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe('Products API Logic', () => {
  describe('sanitizeParams', () => {
    it('should remove null, undefined and empty string values', async () => {
      const mockParams = {
        name: 'test',
        brand: null,
        category: undefined,
        price: '',
        page: 0
      };
      
      (client.get as any).mockResolvedValue({
        data: [],
        page_number: 0,
        page_size: 10,
        count_items: 0,
        count_pages: 0
      });
      
      await getProducts(mockParams as any);
      
      // Check that client.get was called with cleaned params
      expect(client.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { name: 'test', page: 0 }
        })
      );
    });
  });

  describe('Admin Brand/Category Mutations', () => {
    it('should throw error if brand creation status is not 200', async () => {
      (client.post as any).mockResolvedValue({
        status: 500,
        message: 'Brand exists'
      });
      
      await expect(createBrandAdmin({ name: 'Apple', description: '' }))
        .rejects.toThrow('Brand exists');
    });

    it('should return brand data on success', async () => {
      const brand = createMockBrand();
      (client.post as any).mockResolvedValue({
        status: 200,
        data: brand
      });
      
      const result = await createBrandAdmin({ name: 'Apple', description: '' });
      expect(result).toEqual(brand);
    });

    it('should handle category creation failure', async () => {
      (client.post as any).mockResolvedValue({
        status: 400,
        message: 'Invalid data'
      });
      
      await expect(createCategoryAdmin({ name: 'Cat', description: '' }))
        .rejects.toThrow('Invalid data');
    });
  });
});
