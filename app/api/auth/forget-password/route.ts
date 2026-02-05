import { NextResponse } from "next/server";
import { SERVICE_URLS, HTTP_STATUS } from "@/shared/constants";

const BACKEND_URL = `${SERVICE_URLS.USER_SERVICE}/api/auth/forget-password`;

/**
 * Forgot Password API Route
 * POST /api/auth/forget-password
 */

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: HTTP_STATUS.BAD_REQUEST }
            );
        }

        const backendRes = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to send reset email" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        // Response: { status, data: { email, resetToken }, message }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Forget Password Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
