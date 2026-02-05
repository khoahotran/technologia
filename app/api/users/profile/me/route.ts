import { NextResponse } from "next/server";
import { SERVICE_URLS, HTTP_STATUS } from "@/shared/constants";

const BACKEND_URL = `${SERVICE_URLS.USER_SERVICE}/api/users/profile/me`;

/**
 * User Profile API Routes
 * GET /api/users/profile/me - Fetch current user's profile
 * PUT /api/users/profile/me - Update current user's profile
 */

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization header is required" },
                { status: HTTP_STATUS.UNAUTHORIZED }
            );
        }

        const backendRes = await fetch(BACKEND_URL, {
            method: "GET",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to get profile" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Get Profile Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}

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

        const backendRes = await fetch(BACKEND_URL, {
            method: "PUT",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to update profile" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Update Profile Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
