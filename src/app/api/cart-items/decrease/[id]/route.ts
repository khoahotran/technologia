import { createDynamicApiHandler } from "@/lib/api-handler";

export const PATCH = createDynamicApiHandler<{ id: string }>({
    targetService: "cart",
    path: ({ id }) => `/api/cart-items/decrease/${id}`,
    requiresAuth: true,
});
