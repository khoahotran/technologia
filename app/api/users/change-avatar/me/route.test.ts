import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    mockGetAuthToken: vi.fn(),
    mockForwardFormDataToUserService: vi.fn(),
}));

vi.mock("@/lib/api-route", () => ({
    getAuthToken: mocks.mockGetAuthToken,
    forwardFormDataToUserService: mocks.mockForwardFormDataToUserService,
}));

import { PUT } from "./route";

describe("PUT /api/users/change-avatar/me", () => {
    beforeEach(() => {
        mocks.mockGetAuthToken.mockReset();
        mocks.mockForwardFormDataToUserService.mockReset();
    });

    it("returns auth response when authorization is missing", async () => {
        mocks.mockGetAuthToken.mockResolvedValue(null);

        const response = await PUT(new Request("http://localhost/api/users/change-avatar/me"));
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: "Authorization header or cookie is required" });
    });

    it("forwards form-data payload to service when authorized", async () => {
        mocks.mockGetAuthToken.mockResolvedValue("Bearer token");
        mocks.mockForwardFormDataToUserService.mockResolvedValue(
            NextResponse.json({ status: 200, data: { avatarUrl: "/a.jpg" } }, { status: 200 })
        );

        const formData = new FormData();
        formData.append("avatar", new Blob(["x"], { type: "image/png" }), "avatar.png");

        const request = new Request("http://localhost/api/users/change-avatar/me", {
            method: "PUT",
            body: formData,
        });

        // Mock formData() to avoid potential hang in test environment
        request.formData = vi.fn().mockResolvedValue(formData);

        const response = await PUT(request);
        expect(response.status).toBe(200);
        expect(mocks.mockForwardFormDataToUserService).toHaveBeenCalledWith(
            expect.objectContaining({
                path: "/api/users/change-avatar/me",
                method: "PUT",
                authHeader: "Bearer token",
                fallbackError: "Failed to change avatar",
                logLabel: "Change Avatar",
            })
        );
    });
});
