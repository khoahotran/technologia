import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Call Real Backend
        // Using username as email for local simplified login if needed, or pass both
        // API expects: { username, password }
        // Frontend passes: { email, password }
        // Assumption: User enters username or email. API doc says "username".
        // We will map email input to 'username' field for the backend call.

        const backendRes = await fetch("http://localhost:8081/api/auth/login/local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: email, // Mapping email input to username for backend
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

        const { accessToken } = data.data;

        // Set HttpOnly Cookie
        const cookieStore = await cookies();
        cookieStore.set("auth_token", accessToken, {
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
            user: { userId: data.data.userId }
        });

    } catch (error) {
        console.error("Login Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
