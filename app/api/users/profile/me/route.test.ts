import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    mockRequireAuthorizationHeader: vi.fn(),
    mockForwardJsonToUserService: vi.fn(),
}));

vi.mock("@/lib/api-route", () => ({
    requireAuthorizationHeader: mocks.mockRequireAuthorizationHeader,
    forwardJsonToUserService: mocks.mockForwardJsonToUserService,
}));

import { GET, PUT } from "./route";

describe("/api/users/profile/me route", () => {
    beforeEach(() => {
        mocks.mockRequireAuthorizationHeader.mockReset();
        mocks.mockForwardJsonToUserService.mockReset();
    });

    it("GET returns auth response when authorization is missing", async () => {
        mocks.mockRequireAuthorizationHeader.mockReturnValue(
            NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
        );

        const response = await GET(new Request("http://localhost/api/users/profile/me"));
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: "Authorization header is required" });
        expect(mocks.mockForwardJsonToUserService).not.toHaveBeenCalled();
    });

    it("PUT forwards body when authorization is present", async () => {
        mocks.mockRequireAuthorizationHeader.mockReturnValue("Bearer token");
        mocks.mockForwardJsonToUserService.mockResolvedValue(
            NextResponse.json({ status: 200, data: { fullName: "John" } }, { status: 200 })
        );

        const request = new Request("http://localhost/api/users/profile/me", {
            method: "PUT",
            body: JSON.stringify({ fullName: "John" }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PUT(request);
        expect(response.status).toBe(200);
        expect(mocks.mockForwardJsonToUserService).toHaveBeenCalledWith({
            path: "/api/users/profile/me",
            method: "PUT",
            authHeader: "Bearer token",
            body: { fullName: "John" },
            fallbackError: "Failed to update profile",
            logLabel: "Update Profile",
        });
    });
});
