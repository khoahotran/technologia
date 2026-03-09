import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    mockGetAuthToken: vi.fn(),
    mockForwardJsonToUserService: vi.fn(),
}));

vi.mock("@/lib/api-route", () => ({
    getAuthToken: mocks.mockGetAuthToken,
    forwardJsonToUserService: mocks.mockForwardJsonToUserService,
}));

import { PUT } from "./route";

describe("PUT /api/users/change-password/me", () => {
    beforeEach(() => {
        mocks.mockGetAuthToken.mockReset();
        mocks.mockForwardJsonToUserService.mockReset();
    });

    it("returns auth response when authorization is missing", async () => {
        mocks.mockGetAuthToken.mockResolvedValue(null);

        const response = await PUT(new Request("http://localhost/api/users/change-password/me"));
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: "Authorization header (Bearer token) is required" });
    });

    it("returns 400 when old/new password is missing", async () => {
        mocks.mockGetAuthToken.mockResolvedValue("Bearer token");

        const request = new Request("http://localhost/api/users/change-password/me", {
            method: "PUT",
            body: JSON.stringify({ oldPassword: "" }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PUT(request);
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Old password and new password are required" });
        expect(mocks.mockForwardJsonToUserService).not.toHaveBeenCalled();
    });

    it("forwards valid change-password payload", async () => {
        mocks.mockGetAuthToken.mockResolvedValue("Bearer token");
        mocks.mockForwardJsonToUserService.mockResolvedValue(
            NextResponse.json({ status: 200, data: {}, message: "ok" }, { status: 200 })
        );

        const request = new Request("http://localhost/api/users/change-password/me", {
            method: "PUT",
            body: JSON.stringify({ oldPassword: "old", newPassword: "new" }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PUT(request);
        expect(response.status).toBe(200);
        expect(mocks.mockForwardJsonToUserService).toHaveBeenCalledWith({
            path: "/api/users/change-password/me",
            method: "PUT",
            authHeader: "Bearer token",
            body: { oldPassword: "old", newPassword: "new" },
            fallbackError: "Failed to change password",
            logLabel: "Change Password",
        });
    });
});
