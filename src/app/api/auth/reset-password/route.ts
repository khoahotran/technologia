import { NextResponse } from "next/server";

import { HTTP_STATUS } from "@/constants";
import { forwardJsonToUserService } from "@/lib/api-route";

/**
 * Reset Password API Route
 * POST /api/auth/reset-password
 */

export async function POST(request: Request) {
    const body = await request.json();
    const { resetToken, newPassword } = body;

    if (!resetToken || !newPassword) {
        return NextResponse.json(
            { error: "Reset token and new password are required" },
            { status: HTTP_STATUS.BAD_REQUEST }
        );
    }

    return forwardJsonToUserService({
        path: "/api/auth/reset-password",
        method: "POST",
        body: { resetToken, newPassword },
        fallbackError: "Password reset failed",
        logLabel: "Reset Password",
    });
}
