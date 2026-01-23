import { createProxy } from "@/lib/api-proxy";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const TARGET_URL = `http://localhost:8082/api/categories/${id}`;
    return createProxy(req, TARGET_URL);
}
