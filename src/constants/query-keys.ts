/**
 * TanStack Query key factories — colocated by feature for autocomplete & cache invalidation.
 * Import from here to ensure consistent key shapes across hooks.
 */

export const productKeys = {
    all: ['products'] as const,
    list: (params?: Record<string, unknown>) => ['products', 'list', params] as const,
    detail: (id: string | number) => ['products', 'detail', id] as const,
};

export const cartKeys = {
    all: ['cart'] as const,
    detail: () => ['cart', 'detail'] as const,
    price: (itemIds: readonly string[]) => ['cart', 'price', itemIds] as const,
};

export const userKeys = {
    all: ['user'] as const,
    profile: () => ['user', 'profile'] as const,
};

export const checkoutKeys = {
    all: ['checkout'] as const,
    addresses: () => ['checkout', 'addresses'] as const,
    orders: (params?: { page?: number | undefined; size?: number | undefined; status?: string | undefined }) => {
        if (params) return ['checkout', 'orders', params] as const;
        return ['checkout', 'orders'] as const;
    },
    order: (id: string) => ['checkout', 'orders', id] as const,
};
