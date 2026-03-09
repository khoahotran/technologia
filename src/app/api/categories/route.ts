import { createApiHandler } from "@/lib/api-handler";

/**
 * Categories API Routes
 * Proxies to Product Service
 */

export const GET = createApiHandler({
    targetService: 'product',
    path: '/api/categories',
});
