import { NextResponse } from "next/server";

import { HTTP_STATUS } from "@/constants";
import { forwardJsonToUserService } from "@/lib/api-route";

/**
 * Forgot Password API Route
 * POST /api/auth/forget-password
 */

export async function POST(request: Request) {
    const body = await request.json();
    const { email } = body;

    if (!email) {
        return NextResponse.json(
            { error: "Email is required" },
            { status: HTTP_STATUS.BAD_REQUEST }
        );
    }

    return forwardJsonToUserService({
        path: "/api/auth/forget-password",
        method: "POST",
        body: { email },
        fallbackError: "Failed to send reset email",
        logLabel: "Forget Password",
    });
}
