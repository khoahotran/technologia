import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HTTP_STATUS, COOKIE_NAMES } from "@/shared/constants";

/**
 * Current User API Route
 * GET /api/auth/me
 * 
 * TODO: Replace mock verification with actual token validation
 */

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.AUTH_TOKEN);

    if (!token) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: HTTP_STATUS.UNAUTHORIZED }
        );
    }

    // Verify token (Mock verification)
    // TODO: Implement actual JWT verification or call backend
    if (token.value === "mock_jwt_token_secure") {
        return NextResponse.json({
            user: {
                id: "1",
                email: "user@example.com",
                role: "user",
            },
        });
    }

    return NextResponse.json(
        { error: "Invalid token" },
        { status: HTTP_STATUS.UNAUTHORIZED }
    );
}
