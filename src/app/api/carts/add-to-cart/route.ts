import { createApiHandler } from "@/lib/api-handler";

export const POST = createApiHandler({
    targetService: "cart",
    path: "/api/carts/add-to-cart",
    requiresAuth: true,
});
