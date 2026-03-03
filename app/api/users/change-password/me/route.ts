import { NextResponse } from "next/server";

import { forwardJsonToUserService, getAuthToken } from "@/lib/api-route";
import { HTTP_STATUS } from "@/shared/constants";

/**
 * Change Password API Route
 * PUT /api/users/change-password/me
 */

export async function PUT(request: Request) {
    const token = await getAuthToken(request);
    if (!token) {
        return NextResponse.json(
            { error: "Authorization header or cookie is required" },
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

    return forwardJsonToUserService({
        path: "/api/users/change-password/me",
        method: "PUT",
        authHeader: token,
        body: { oldPassword, newPassword },
        fallbackError: "Failed to change password",
        logLabel: "Change Password",
    });
}
