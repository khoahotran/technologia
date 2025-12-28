import MockAdapter from 'axios-mock-adapter';
import { httpClient } from './client';

let mock: MockAdapter | null = null;

export const setupMocks = () => {
    if (mock) return;

    console.log('🔶 Initializing Mocks...');
    mock = new MockAdapter(httpClient, { delayResponse: 500, onNoMatch: 'passthrough' });

    // User Mock
    mock.onGet('/users/me').reply(200, {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
    });

    // Product Mocks
    const products = Array.from({ length: 10 }).map((_, i) => ({
        productId: `prod-${i + 1}`,
        name: `Product ${i + 1}`,
        price: { amount: (i + 1) * 100, currency: 'USD' },
        description: `Description for Product ${i + 1}`
    }));

    mock.onGet('/products').reply(200, products);
    mock.onGet(/\/products\/prod-\d+/).reply(200, products[0]);

    console.log('✅ Mocks initialized');
};
