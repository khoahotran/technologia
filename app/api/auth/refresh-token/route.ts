import { NextResponse } from "next/server";
import { SERVICE_URLS, HTTP_STATUS } from "@/shared/constants";

const BACKEND_URL = `${SERVICE_URLS.USER_SERVICE}/api/auth/refresh-token`;

/**
 * Refresh Token API Route
 * POST /api/auth/refresh-token
 */

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json(
                { error: "Refresh token is required" },
                { status: HTTP_STATUS.BAD_REQUEST }
            );
        }

        const backendRes = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Token refresh failed" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        // Response: { status, data: { accessToken, refreshToken, userId }, message }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Refresh Token Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
