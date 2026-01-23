import { createProxy } from "@/lib/api-proxy";

const TARGET_URL = "http://localhost:8082/api/categories";

export async function GET(req: Request) {
    return createProxy(req, TARGET_URL);
}
