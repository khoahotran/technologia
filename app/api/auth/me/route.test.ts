import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    mockCookiesGet: vi.fn(),
    mockForwardJsonToUserService: vi.fn(),
}));

vi.mock("next/headers", () => ({
    cookies: vi.fn(async () => ({
        get: mocks.mockCookiesGet,
    })),
}));

vi.mock("@/lib/api-route", () => ({
    forwardJsonToUserService: mocks.mockForwardJsonToUserService,
}));

import { GET } from "./route";

describe("GET /api/auth/me", () => {
    beforeEach(() => {
        mocks.mockCookiesGet.mockReset();
        mocks.mockForwardJsonToUserService.mockReset();
    });

    it("returns 401 when no auth header and no auth cookies", async () => {
        mocks.mockCookiesGet.mockReturnValue(undefined);
        const request = new Request("http://localhost/api/auth/me");

        const response = await GET(request);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: "Unauthorized" });
        expect(mocks.mockForwardJsonToUserService).not.toHaveBeenCalled();
    });

    it("uses Authorization header when provided", async () => {
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

    it("falls back to access token cookie when header is missing", async () => {
        mocks.mockCookiesGet.mockImplementation((name: string) =>
            name === "access_token" ? { value: "cookie-token" } : undefined
        );
        mocks.mockForwardJsonToUserService.mockResolvedValue(
            NextResponse.json({ user: { id: "1" } }, { status: 200 })
        );

        const request = new Request("http://localhost/api/auth/me");
        await GET(request);

        expect(mocks.mockForwardJsonToUserService).toHaveBeenCalledWith(
            expect.objectContaining({
                authHeader: "Bearer cookie-token",
            })
        );
    });
});
