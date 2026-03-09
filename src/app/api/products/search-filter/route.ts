import { createApiHandler } from "@/lib/api-handler";

/**
 * Search & Filter Products API Route
 * GET /api/products/search-filter
 */

export const GET = createApiHandler({
    targetService: 'product',
    path: '/api/products/search-filter',
});
