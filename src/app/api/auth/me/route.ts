import { NextResponse } from "next/server";

import { HTTP_STATUS } from "@/constants";
import { forwardJsonToUserService } from "@/lib/api-route";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const bearerAuth =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader : null;

  if (!bearerAuth) {
    return NextResponse.json(
      { error: "Authorization header (Bearer token) is required" },
      { status: HTTP_STATUS.UNAUTHORIZED }
    );
  }

  return forwardJsonToUserService({
    path: "/api/auth/me",
    method: "GET",
    authHeader: bearerAuth,
    fallbackError: "Unauthorized",
    logLabel: "Auth Me",
  });
}
