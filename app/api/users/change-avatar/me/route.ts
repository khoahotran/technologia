import { NextResponse } from "next/server";
import { SERVICE_URLS, HTTP_STATUS } from "@/shared/constants";

const BACKEND_URL = `${SERVICE_URLS.USER_SERVICE}/api/users/change-avatar/me`;

/**
 * Change Avatar API Route
 * PUT /api/users/change-avatar/me (multipart/form-data)
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

        // Get the form data from the request
        const formData = await request.formData();

        // Forward the multipart request to backend
        const backendRes = await fetch(BACKEND_URL, {
            method: "PUT",
            headers: {
                Authorization: authHeader,
                // Don't set Content-Type - let fetch set it with boundary for multipart
            },
            body: formData,
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to change avatar" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        // Response: { status, data: { avatarUrl }, message }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Change Avatar Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
