import { createDynamicApiHandler } from "@/lib/api-handler";

export const GET = createDynamicApiHandler<{ id: string }>({
    targetService: "cart",
    path: ({ id }) => `/api/carts/item/${id}`,
    requiresAuth: true,
});
