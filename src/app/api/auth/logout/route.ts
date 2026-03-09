import { NextResponse } from "next/server";

import { HTTP_STATUS } from "@/constants";
import { forwardJsonToUserService } from "@/lib/api-route";

/**
 * Logout API Route
 * POST /api/auth/logout
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
        path: "/api/auth/logout",
        method: "POST",
        body: { refreshToken },
        fallbackError: "Logout failed",
        logLabel: "Logout",
        mapSuccess: () => ({
            status: HTTP_STATUS.OK,
            data: {},
            message: "Logout successful!",
        }),
    });
}
