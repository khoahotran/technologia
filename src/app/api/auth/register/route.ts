import { forwardJsonToUserService } from "@/lib/api-route";

/**
 * Register API Route
 * POST /api/auth/register
 */

export async function POST(request: Request) {
    const body = await request.json();
    return forwardJsonToUserService({
        path: "/api/auth/register/local",
        method: "POST",
        body,
        fallbackError: "Registration failed",
        logLabel: "Register",
    });
}
