import { NextResponse } from "next/server";

import { forwardFormDataToUserService, getAuthToken } from "@/lib/api-route";
import { HTTP_STATUS } from "@/shared/constants";

/**
 * Change Avatar API Route
 * PUT /api/users/change-avatar/me (multipart/form-data)
 */

export async function PUT(request: Request) {
    const token = await getAuthToken(request);
    if (!token) {
        return NextResponse.json(
            { error: "Authorization header or cookie is required" },
            { status: HTTP_STATUS.UNAUTHORIZED }
        );
    }

    const formData = await request.formData();
    return forwardFormDataToUserService({
        path: "/api/users/change-avatar/me",
        method: "PUT",
        authHeader: token,
        formData,
        fallbackError: "Failed to change avatar",
        logLabel: "Change Avatar",
    });
}
