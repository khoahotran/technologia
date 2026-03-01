import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CartRepository } from '../cart.repository';
import { httpClient } from '@/infrastructure/http/client';

// mock axios client
vi.mock('@/infrastructure/http/client', () => ({
    httpClient: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('CartRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getCart should call GET /carts and return map', async () => {
        const mocked = {
            status: 200,
            data: {
                map: {
                    cartId: 'c1',
                    cartItems: [],
                },
            },
        };
        vi.mocked(httpClient.get).mockResolvedValue(mocked as any);

        const result = await CartRepository.getCart();
        expect(httpClient.get).toHaveBeenCalledWith('/carts');
        expect(result.cartId).toBe('c1');
    });

    it('addToCart should POST and return mutation response', async () => {
        const mocked = {
            status: 200,
            data: { status: 200, data: { productId: 'p1' }, message: 'ok' },
        };
        vi.mocked(httpClient.post).mockResolvedValue(mocked as any);

        const resp = await CartRepository.addToCart({ productId: 'p1', variantId: 'v1' });
        expect(httpClient.post).toHaveBeenCalledWith('/carts/add-to-cart', { productId: 'p1', variantId: 'v1' });
        expect(resp.data?.productId).toBe('p1');
    });

    it('remove should DELETE (not patch) the cart item', async () => {
        const mocked = {
            status: 200,
            data: { status: 200, data: null, message: 'deleted' },
        };
        vi.mocked(httpClient.delete).mockResolvedValue(mocked as any);

        await CartRepository.remove('ci1');
        expect(httpClient.delete).toHaveBeenCalledWith('/cart-items/delete/ci1');
    });
});