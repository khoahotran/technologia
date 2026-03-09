import { createDynamicApiHandler } from "@/lib/api-handler";

/**
 * Single Category API Route
 * GET /api/categories/:id
 */

export const GET = createDynamicApiHandler<{ id: string }>({
    targetService: 'product',
    path: ({ id }) => `/api/categories/${id}`,
});
