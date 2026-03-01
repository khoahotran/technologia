import { createApiHandler } from "@/lib/api-handler";

export const GET = createApiHandler({
    targetService: "cart",
    path: "/api/carts/with-items-paging",
    requiresAuth: true,
});
