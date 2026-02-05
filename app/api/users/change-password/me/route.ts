import { NextResponse } from "next/server";
import { SERVICE_URLS, HTTP_STATUS } from "@/shared/constants";

const BACKEND_URL = `${SERVICE_URLS.USER_SERVICE}/api/users/change-password/me`;

/**
 * Change Password API Route
 * PUT /api/users/change-password/me
 */

export async function PUT(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization header is required" },
                { status: HTTP_STATUS.UNAUTHORIZED }
            );
        }

        const body = await request.json();
        const { oldPassword, newPassword } = body;

        if (!oldPassword || !newPassword) {
            return NextResponse.json(
                { error: "Old password and new password are required" },
                { status: HTTP_STATUS.BAD_REQUEST }
            );
        }

        const backendRes = await fetch(BACKEND_URL, {
            method: "PUT",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to change password" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Change Password Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
