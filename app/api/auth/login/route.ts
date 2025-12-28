import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Mock Validation and Token Generation
        // In a real app, this would verify with a backend service
        if (email === "user@example.com" && password === "password") {
            const mockToken = "mock_jwt_token_secure";
            const user = {
                id: "1",
                email: "user@example.com",
                role: "user",
            };

            // Create response
            const response = NextResponse.json({
                user,
                success: true,
            });

            // Set HttpOnly Cookie
            response.cookies.set({
                name: "auth_token",
                value: mockToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });

            return response;
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
