import { createApiHandler } from "@/lib/api-handler";

/**
 * Paged Products API Route
 * GET /api/products/paged
 */

export const GET = createApiHandler({
    targetService: 'product',
    path: '/api/products/paged',
});
