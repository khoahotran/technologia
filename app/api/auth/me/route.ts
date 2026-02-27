import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { forwardJsonToUserService } from "@/lib/api-route";
import { HTTP_STATUS, COOKIE_NAMES } from "@/shared/constants";

/**
 * Current User API Route
 * GET /api/auth/me
 */

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const authHeader = request.headers.get("Authorization");
    const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN);
    const bearerAuth = authHeader ?? (token ? `Bearer ${token.value}` : null);

    if (!bearerAuth) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: HTTP_STATUS.UNAUTHORIZED }
        );
    }

    return forwardJsonToUserService({
        path: "/api/auth/me",
        method: "GET",
        authHeader: bearerAuth,
        fallbackError: "Unauthorized",
        logLabel: "Auth Me",
    });
}
