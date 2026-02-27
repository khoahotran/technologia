import { NextResponse } from "next/server";

import { forwardJsonToUserService, requireAuthorizationHeader } from "@/lib/api-route";

/**
 * User Profile API Routes
 * GET /api/users/profile/me - Fetch current user's profile
 * PUT /api/users/profile/me - Update current user's profile
 */

export async function GET(request: Request) {
    const authHeaderOrResponse = requireAuthorizationHeader(request);
    if (authHeaderOrResponse instanceof NextResponse) {
        return authHeaderOrResponse;
    }

    return forwardJsonToUserService({
        path: "/api/users/profile/me",
        method: "GET",
        authHeader: authHeaderOrResponse,
        fallbackError: "Failed to get profile",
        logLabel: "Get Profile",
    });
}

export async function PUT(request: Request) {
    const authHeaderOrResponse = requireAuthorizationHeader(request);
    if (authHeaderOrResponse instanceof NextResponse) {
        return authHeaderOrResponse;
    }

    const body = await request.json();
    return forwardJsonToUserService({
        path: "/api/users/profile/me",
        method: "PUT",
        authHeader: authHeaderOrResponse,
        body,
        fallbackError: "Failed to update profile",
        logLabel: "Update Profile",
    });
}
