import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Frontend Model might differ slightly from Backend requirements
        // Backend: { username, password, email, ... }

        // Simple pass-through
        const backendRes = await fetch("http://localhost:8081/api/auth/register/local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Registration failed" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        // data.data contains the user object

        return NextResponse.json(data);

    } catch (error) {
        console.error("Register Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
