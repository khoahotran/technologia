import { NextResponse } from "next/server";

import { forwardJsonToUserService, setAccessTokenCookie } from "@/lib/api-route";
import { HTTP_STATUS } from "@/shared/constants";
import { safe } from "@/shared/utils/result";

/**
 * Google Login API Route
 * POST /api/auth/login/google
 */

export async function POST(request: Request) {
    const [result, error] = await safe((async () => {
        const body = await request.json();
        const response = await forwardJsonToUserService({
            path: "/api/auth/login/google",
            method: "POST",
            body,
            fallbackError: "Google Login failed",
            logLabel: "Google Login",
        });

        if (!response.ok) {
            return response;
        }

        const responseData = await response.json();
        const backendData = responseData.data ?? {};
        const accessToken = backendData.token || backendData.accessToken;
        const refreshToken = backendData.refreshToken;

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

    if (error) {
        console.error("Google Login Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }

    return result as NextResponse;
}
