import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Call Real Backend
        // API expects: { username, password }
        // Frontend passed: { username, password }

        const backendRes = await fetch("http://localhost:8081/api/auth/login/local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password
            }),
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
        cookieStore.set("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        // Return User Info to Frontend (Frontend expects user object)
        // Since login only returns IDs, we might need to fetch profile or just return basic info.
        // For now, return what we have: userId. The AuthProvider calls /api/auth/me immediately after.

        return NextResponse.json({
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { userId: backendData.userId }
        });

    } catch (error) {
        console.error("Login Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
