import { createApiHandler } from "@/lib/api-handler";

/**
 * Paged Brands API Route
 * GET /api/brands/paged
 */

export const GET = createApiHandler({
    targetService: 'product',
    path: '/api/brands/paged',
});
