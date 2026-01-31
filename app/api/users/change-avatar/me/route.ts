import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8081/api/users/change-avatar/me";

// PUT: Change user's avatar (multipart/form-data)
export async function PUT(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization header is required" },
                { status: 401 }
            );
        }

        // Get the form data from the request
        const formData = await request.formData();

        // Forward the multipart request to backend
        const backendRes = await fetch(BACKEND_URL, {
            method: "PUT",
            headers: {
                "Authorization": authHeader,
                // Don't set Content-Type - let fetch set it with boundary for multipart
            },
            body: formData,
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to change avatar" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        // Response: { status, data: { avatarUrl }, message }
        return NextResponse.json(data);

    } catch (error) {
        console.error("Change Avatar Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
