import { createApiHandler } from "@/lib/api-handler";

/**
 * Brands API Routes
 * Proxies to Product Service
 */

export const GET = createApiHandler({
    targetService: 'product',
    path: '/api/brands',
});
