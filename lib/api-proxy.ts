import { NextResponse } from "next/server";

export async function createProxy(
    req: Request,
    targetUrl: string
) {
    try {
        const { search } = new URL(req.url);
        // Append query params from the original request
        const finalUrl = targetUrl + search;

        console.warn(`[Proxy] Forwarding ${req.method} ${req.url} -> ${finalUrl}`);

        const res = await fetch(finalUrl, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                // Pass auth header if present, or other headers
                ...(req.headers.get("Authorization") ? { "Authorization": req.headers.get("Authorization")! } : {}),
            },
            // Body for POST/PUT/PATCH
            body: ["GET", "HEAD"].includes(req.method) ? null : await req.arrayBuffer(),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return NextResponse.json(
                { error: data.message || `Proxy Error: ${res.statusText}` },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Proxy] Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
