import { NextResponse } from "next/server";

import { forwardJsonToUserService, setAccessTokenCookie } from "@/lib/api-route";
import { HTTP_STATUS } from "@/shared/constants";

/**
 * Google Login API Route
 * POST /api/auth/login/google
 */

export async function POST(request: Request) {
    try {
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
        if (typeof accessToken === "string" && accessToken.length > 0) {
            await setAccessTokenCookie(accessToken);
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Google Login Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
