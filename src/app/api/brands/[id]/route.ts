import { createDynamicApiHandler } from "@/lib/api-handler";

/**
 * Single Brand API Route
 * GET /api/brands/:id
 */

export const GET = createDynamicApiHandler<{ id: string }>({
    targetService: 'product',
    path: ({ id }) => `/api/brands/${id}`,
});
