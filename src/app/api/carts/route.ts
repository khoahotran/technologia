import { createApiHandler } from "@/lib/api-handler";

export const GET = createApiHandler({
    targetService: "cart",
    path: "/api/carts",
    requiresAuth: true,
});
