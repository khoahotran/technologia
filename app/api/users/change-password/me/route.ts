import { NextResponse } from "next/server";

import { forwardJsonToUserService, requireAuthorizationHeader } from "@/lib/api-route";
import { HTTP_STATUS } from "@/shared/constants";

/**
 * Change Password API Route
 * PUT /api/users/change-password/me
 */

export async function PUT(request: Request) {
    const authHeaderOrResponse = requireAuthorizationHeader(request);
    if (authHeaderOrResponse instanceof NextResponse) {
        return authHeaderOrResponse;
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
        authHeader: authHeaderOrResponse,
        body: { oldPassword, newPassword },
        fallbackError: "Failed to change password",
        logLabel: "Change Password",
    });
}
