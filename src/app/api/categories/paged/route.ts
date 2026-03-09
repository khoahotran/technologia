import { createApiHandler } from "@/lib/api-handler";

/**
 * Paged Categories API Route
 * GET /api/categories/paged
 */

export const GET = createApiHandler({
    targetService: 'product',
    path: '/api/categories/paged',
});
