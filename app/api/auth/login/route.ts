import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SERVICE_URLS, HTTP_STATUS, COOKIE_NAMES } from "@/shared/constants";

const BACKEND_URL = `${SERVICE_URLS.USER_SERVICE}/api/auth/login/local`;

/**
 * Local Login API Route
 * POST /api/auth/login
 */

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const backendRes = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Login failed" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        // Expected structure: { status: 200, data: { accessToken, refreshToken, userId }, message }

        const { data: backendData } = data;
        const accessToken = backendData.accessToken || backendData.access_token;
        const refreshToken = backendData.refreshToken || backendData.refresh_token;

        // Set HttpOnly Cookie
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        // Return User Info to Frontend
        return NextResponse.json({
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { userId: backendData.userId },
        });
    } catch (error) {
        console.error("Login Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
