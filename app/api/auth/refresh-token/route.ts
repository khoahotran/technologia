import { NextResponse } from "next/server";

import { forwardJsonToUserService } from "@/lib/api-route";
import { HTTP_STATUS } from "@/shared/constants";

/**
 * Refresh Token API Route
 * POST /api/auth/refresh-token
 */

export async function POST(request: Request) {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
        return NextResponse.json(
            { error: "Refresh token is required" },
            { status: HTTP_STATUS.BAD_REQUEST }
        );
    }

    return forwardJsonToUserService({
        path: "/api/auth/refresh-token",
        method: "POST",
        body: { refreshToken },
        fallbackError: "Token refresh failed",
        logLabel: "Refresh Token",
    });
}
