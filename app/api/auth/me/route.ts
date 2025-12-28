import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token (Mock verification)
    if (token.value === "mock_jwt_token_secure") {
        return NextResponse.json({
            user: {
                id: "1",
                email: "user@example.com",
                role: "user",
            },
        });
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
}
