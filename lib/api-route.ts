import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_NAMES, HTTP_STATUS, SERVICE_URLS } from "@/shared/constants";

type JsonRecord = Record<string, unknown>;

interface ForwardToUserServiceOptions {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: JsonRecord;
    authHeader?: string;
    fallbackError: string;
    logLabel: string;
    mapSuccess?: (data: JsonRecord) => JsonRecord;
}

interface ForwardFormDataOptions {
    path: string;
    method: "PUT" | "POST" | "PATCH";
    formData: FormData;
    authHeader?: string;
    fallbackError: string;
    logLabel: string;
}

function parseErrorMessage(data: unknown, fallbackError: string): string {
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
        return data.message;
    }
    return fallbackError;
}

async function parseJsonSafe(res: Response): Promise<JsonRecord> {
    try {
        const json = await res.json();
        if (json && typeof json === "object") {
            return json as JsonRecord;
        }
        return {};
    } catch {
        return {};
    }
}

export function requireAuthorizationHeader(request: Request): string | NextResponse {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
        return NextResponse.json(
            { error: "Authorization header is required" },
            { status: HTTP_STATUS.UNAUTHORIZED }
        );
    }
    return authHeader;
}

export async function setAccessTokenCookie(accessToken: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}

export async function forwardJsonToUserService(options: ForwardToUserServiceOptions): Promise<NextResponse> {
    const { path, method, body, authHeader, fallbackError, logLabel, mapSuccess } = options;

    try {
        const backendRes = await fetch(`${SERVICE_URLS.USER_SERVICE}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await parseJsonSafe(backendRes);

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: parseErrorMessage(data, fallbackError) },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(mapSuccess ? mapSuccess(data) : data);
    } catch (error) {
        console.error(`${logLabel} Proxy Error:`, error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}

export async function forwardFormDataToUserService(options: ForwardFormDataOptions): Promise<NextResponse> {
    const { path, method, formData, authHeader, fallbackError, logLabel } = options;

    try {
        const backendRes = await fetch(`${SERVICE_URLS.USER_SERVICE}${path}`, {
            method,
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: formData,
        });

        const data = await parseJsonSafe(backendRes);

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: parseErrorMessage(data, fallbackError) },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`${logLabel} Proxy Error:`, error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
