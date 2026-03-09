import { NextResponse } from "next/server";

import { HTTP_STATUS } from "@/constants";
import { forwardJsonToUserService, getAuthToken } from "@/lib/api-route";

/**
 * User Profile API Routes
 * GET /api/users/profile/me - Fetch current user's profile
 * PUT /api/users/profile/me - Update current user's profile
 */

export async function GET(request: Request) {
    const token = await getAuthToken(request);
    if (!token) {
        return NextResponse.json(
            { error: "Authorization header (Bearer token) is required" },
            { status: HTTP_STATUS.UNAUTHORIZED }
        );
    }

    return forwardJsonToUserService({
        path: "/api/users/profile/me",
        method: "GET",
        authHeader: token,
        fallbackError: "Failed to get profile",
        logLabel: "Get Profile",
    });
}

export async function PUT(request: Request) {
    const token = await getAuthToken(request);
    if (!token) {
        return NextResponse.json(
            { error: "Authorization header (Bearer token) is required" },
            { status: HTTP_STATUS.UNAUTHORIZED }
        );
    }

    const body = await request.json();
    return forwardJsonToUserService({
        path: "/api/users/profile/me",
        method: "PUT",
        authHeader: token,
        body,
        fallbackError: "Failed to update profile",
        logLabel: "Update Profile",
    });
}
