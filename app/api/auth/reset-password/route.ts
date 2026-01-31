import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8081/api/auth/reset-password";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { resetToken, newPassword } = body;

        if (!resetToken || !newPassword) {
            return NextResponse.json(
                { error: "Reset token and new password are required" },
                { status: 400 }
            );
        }

        const backendRes = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resetToken, newPassword }),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Password reset failed" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Reset Password Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
