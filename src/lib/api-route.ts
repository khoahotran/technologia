import { NextResponse } from "next/server";

import { getAuthToken as getAuthTokenUtil, parseErrorMessage, parseJsonSafe } from "./api-utils";

import { HTTP_STATUS, SERVICE_URLS } from "@/constants";
import { safe } from "@/utils/result";

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

export async function getAuthToken(request: Request): Promise<string | null> {
  return getAuthTokenUtil(request);
}

export function requireAuthorizationHeader(request: Request): string | NextResponse {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header (Bearer token) is required" },
      { status: HTTP_STATUS.UNAUTHORIZED }
    );
  }
  return authHeader;
}

export async function forwardJsonToUserService(
  options: ForwardToUserServiceOptions
): Promise<NextResponse> {
  const { path, method, body, authHeader, fallbackError, logLabel, mapSuccess } = options;

  const [backendRes, error] = await safe(
    fetch(`${SERVICE_URLS.USER_SERVICE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  );

  if (error) {
    console.error(`${logLabel} proxy error:`, error);
    return NextResponse.json(
      { error: "Service connection error" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }

  const data = await parseJsonSafe(backendRes!);
  if (!backendRes!.ok) {
    return NextResponse.json(
      { error: parseErrorMessage(data, fallbackError) },
      { status: backendRes!.status }
    );
  }

  return NextResponse.json(mapSuccess ? mapSuccess(data) : data);
}

export async function forwardFormDataToUserService(
  options: ForwardFormDataOptions
): Promise<NextResponse> {
  const { path, method, formData, authHeader, fallbackError, logLabel } = options;

  const [backendRes, error] = await safe(
    fetch(`${SERVICE_URLS.USER_SERVICE}${path}`, {
      method,
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: formData,
    })
  );

  if (error) {
    console.error(`${logLabel} proxy error:`, error);
    return NextResponse.json(
      { error: "Service connection error" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }

  const data = await parseJsonSafe(backendRes!);
  if (!backendRes!.ok) {
    return NextResponse.json(
      { error: parseErrorMessage(data, fallbackError) },
      { status: backendRes!.status }
    );
  }

  return NextResponse.json(data);
}
