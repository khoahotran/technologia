import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const backendRes = await fetch("http://localhost:8081/api/auth/login/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Google Login failed" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        const { data: backendData } = data;

        // Postman: { token, refreshToken, userId }
        const accessToken = backendData.token || backendData.accessToken;

        const cookieStore = await cookies();
        cookieStore.set("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json(data);

    } catch (error) {
        console.error("Google Login Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
