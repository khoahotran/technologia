import { createApiHandler } from "@/lib/api-handler";

/**
 * Products API Routes
 * Proxies to Product Service
 */

// GET /api/products
export const GET = createApiHandler({
    targetService: 'product',
    path: '/api/products',
});

// POST /api/products (admin only)
export const POST = createApiHandler({
    targetService: 'product',
    path: '/api/products',
    requiresAuth: true,
});
