import { NextResponse } from "next/server";

import { forwardFormDataToUserService, requireAuthorizationHeader } from "@/lib/api-route";

/**
 * Change Avatar API Route
 * PUT /api/users/change-avatar/me (multipart/form-data)
 */

export async function PUT(request: Request) {
    const authHeaderOrResponse = requireAuthorizationHeader(request);
    if (authHeaderOrResponse instanceof NextResponse) {
        return authHeaderOrResponse;
    }

    const formData = await request.formData();
    return forwardFormDataToUserService({
        path: "/api/users/change-avatar/me",
        method: "PUT",
        authHeader: authHeaderOrResponse,
        formData,
        fallbackError: "Failed to change avatar",
        logLabel: "Change Avatar",
    });
}
