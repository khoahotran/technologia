import { createDynamicApiHandler } from "@/lib/api-handler";

/**
 * Single Product API Routes
 * GET /api/products/:id
 */

export const GET = createDynamicApiHandler<{ id: string }>({
    targetService: 'product',
    path: ({ id }) => `/api/products/${id}`,
});

export const PUT = createDynamicApiHandler<{ id: string }>({
    targetService: 'product',
    path: ({ id }) => `/api/products/${id}`,
    requiresAuth: true,
});

export const DELETE = createDynamicApiHandler<{ id: string }>({
    targetService: 'product',
    path: ({ id }) => `/api/products/${id}`,
    requiresAuth: true,
});
