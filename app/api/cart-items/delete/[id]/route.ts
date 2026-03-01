import { createDynamicApiHandler } from "@/lib/api-handler";

// DELETE should be used here so that the proxy method matches the cart service
export const DELETE = createDynamicApiHandler<{ id: string }>({
    targetService: "cart",
    path: ({ id }) => `/api/cart-items/delete/${id}`,
    requiresAuth: true,
});
