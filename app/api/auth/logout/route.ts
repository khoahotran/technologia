import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8081/api/auth/logout";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json(
                { error: "Refresh token is required" },
                { status: 400 }
            );
        }

        // Call backend to invalidate refresh token
        const backendRes = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Logout failed" },
                { status: backendRes.status }
            );
        }

        return NextResponse.json({
            status: 200,
            data: {},
            message: "Logout successful!"
        });

    } catch (error) {
        console.error("Logout Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
