import { NextResponse } from "next/server";
import { SERVICE_URLS, HTTP_STATUS } from "@/shared/constants";

const BACKEND_URL = `${SERVICE_URLS.USER_SERVICE}/api/auth/logout`;

/**
 * Logout API Route
 * POST /api/auth/logout
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
            status: HTTP_STATUS.OK,
            data: {},
            message: "Logout successful!",
        });
    } catch (error) {
        console.error("Logout Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
