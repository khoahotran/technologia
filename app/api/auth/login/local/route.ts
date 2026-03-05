import { NextResponse } from "next/server";

import { forwardJsonToUserService, setAccessTokenCookie } from "@/lib/api-route";
import { HTTP_STATUS } from "@/shared/constants";
import { safe } from "@/shared/utils/result";

/**
 * Local Login API Route
 * POST /api/auth/login/local
 */

export async function POST(request: Request) {
    const [result, error] = await safe((async () => {
        const body = await request.json();
        const { username, password } = body;

        const response = await forwardJsonToUserService({
            path: "/api/auth/login/local",
            method: "POST",
            body: { username, password },
            fallbackError: "Login failed",
            logLabel: "Login Local",
        });

        if (!response.ok) {
            return response;
        }

        const data = await response.json();
        // Expected structure: { status: 200, data: { accessToken, refreshToken, userId }, message }

        const { data: backendData } = data;
        const accessToken = backendData.accessToken || backendData.access_token;
        const refreshToken = backendData.refreshToken || backendData.refresh_token;

        if (typeof accessToken === "string" && accessToken.length > 0) {
            await setAccessTokenCookie(accessToken);
        }

        // Return in format expected by AuthRepository: { data: { accessToken, refreshToken, userId } }
        return NextResponse.json({
            data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                userId: backendData.userId,
            },
        });
    })());

    if (error !== null) {
        console.error("Login Local Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }

    return result as NextResponse;
}
