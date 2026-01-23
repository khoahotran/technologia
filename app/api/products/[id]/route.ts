import { createProxy } from "@/lib/api-proxy";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params are Promises in Next.js 15/latest
) {
    const { id } = await params;
    const TARGET_URL = `http://localhost:8082/api/products/${id}`;
    return createProxy(req, TARGET_URL);
}
