import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CartRepository } from '../cart.repository';

import { fetchWithToken } from '@/infrastructure/http';

// Mock fetchWithToken
vi.mock('@/infrastructure/http', () => ({
    fetchWithToken: vi.fn(),
}));

describe('CartRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getCart should call GET /carts and return map', async () => {
        const mockResponse = {
            status: 200,
            message: 'Cart retrieved successfully',
            data: {
                map: {
                    cartId: 'c1',
                    customerId: 'cust1',
                    updatedAt: '2026-03-03',
                    cartItems: [],
                    totalItems: 0,
                    pageSize: 10,
                    currentPage: 0,
                },
                empty: false,
            },
        };
        vi.mocked(fetchWithToken).mockResolvedValue(mockResponse);

        const result = await CartRepository.getCart();
        expect(fetchWithToken).toHaveBeenCalledWith('/carts', { method: 'GET', query: {} });
        expect(result.cartId).toBe('c1');
    });

    it('addToCart should POST and return mutation response', async () => {
        const mockResponse = {
            status: 200,
            message: 'Add product to cart successfully!',
            data: {
                cartItemId: 'ci1',
                productId: 'p1',
                variantId: 'v1',
                quantityInCart: 1,
                quantityInStock: 10,
            },
        };
        vi.mocked(fetchWithToken).mockResolvedValue(mockResponse);

        await CartRepository.addToCart({ productId: 'p1', variantId: 'v1' });
        expect(fetchWithToken).toHaveBeenCalledWith('/carts/add-to-cart', {
            method: 'POST',
            body: { productId: 'p1', variantId: 'v1' },
        });
    });

    it('remove should PATCH the cart item', async () => {
        const mockResponse = {
            status: 200,
            message: 'delete cart item',
            data: null,
        };
        vi.mocked(fetchWithToken).mockResolvedValue(mockResponse);

        await CartRepository.remove('ci1');
        expect(fetchWithToken).toHaveBeenCalledWith(
            '/cart-items/delete/ci1',
            { method: 'PATCH' }
        );
    });

    it('increase should PATCH cart item to increase quantity', async () => {
        const mockResponse = {
            status: 200,
            message: 'increase cart item',
            data: {
                cartItemId: 'ci1',
                quantityInCart: 2,
                quantityInStock: 10,
            },
        };
        vi.mocked(fetchWithToken).mockResolvedValue(mockResponse);

        const resp = await CartRepository.increase('ci1');
        expect(fetchWithToken).toHaveBeenCalledWith(
            '/cart-items/increase/ci1',
            { method: 'PATCH' }
        );
        expect(resp.quantityInCart).toBe(2);
    });

    it('decrease should PATCH cart item to decrease quantity', async () => {
        const mockResponse = {
            status: 200,
            message: 'decrease cart item',
            data: {
                cartItemId: 'ci1',
                quantityInCart: 1,
                quantityInStock: 10,
            },
        };
        vi.mocked(fetchWithToken).mockResolvedValue(mockResponse);

        const resp = await CartRepository.decrease('ci1');
        expect(fetchWithToken).toHaveBeenCalledWith(
            '/cart-items/decrease/ci1',
            { method: 'PATCH' }
        );
        expect(resp.quantityInCart).toBe(1);
    });

    it('calculatePrice should POST and return price', async () => {
        const mockResponse = {
            status: 200,
            message: 'Total price calculated successfully',
            data: 99999,
        };
        vi.mocked(fetchWithToken).mockResolvedValue(mockResponse);

        const price = await CartRepository.calculatePrice({
            cartItemIds: ['ci1', 'ci2'],
        });
        expect(fetchWithToken).toHaveBeenCalledWith('/carts/price', {
            method: 'POST',
            body: { cartItemIds: ['ci1', 'ci2'] },
        });
        expect(price).toBe(99999);
    });
});