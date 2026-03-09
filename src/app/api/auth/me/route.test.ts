import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockForwardJsonToUserService: vi.fn(),
}));

vi.mock("@/lib/api-route", () => ({
  forwardJsonToUserService: mocks.mockForwardJsonToUserService,
}));

import { GET } from "./route";

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    mocks.mockForwardJsonToUserService.mockReset();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const request = new Request("http://localhost/api/auth/me");
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Authorization header (Bearer token) is required",
    });
    expect(mocks.mockForwardJsonToUserService).not.toHaveBeenCalled();
  });

  it("forwards request when Authorization header is valid", async () => {
    mocks.mockForwardJsonToUserService.mockResolvedValue(
      NextResponse.json({ user: { id: "1" } }, { status: 200 })
    );

    const request = new Request("http://localhost/api/auth/me", {
      headers: { Authorization: "Bearer header-token" },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(mocks.mockForwardJsonToUserService).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/auth/me",
        method: "GET",
        authHeader: "Bearer header-token",
      })
    );
  });
});
