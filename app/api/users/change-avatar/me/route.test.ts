import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    mockRequireAuthorizationHeader: vi.fn(),
    mockForwardFormDataToUserService: vi.fn(),
}));

vi.mock("@/lib/api-route", () => ({
    requireAuthorizationHeader: mocks.mockRequireAuthorizationHeader,
    forwardFormDataToUserService: mocks.mockForwardFormDataToUserService,
}));

import { PUT } from "./route";

describe("PUT /api/users/change-avatar/me", () => {
    beforeEach(() => {
        mocks.mockRequireAuthorizationHeader.mockReset();
        mocks.mockForwardFormDataToUserService.mockReset();
    });

    it("returns auth response when authorization is missing", async () => {
        mocks.mockRequireAuthorizationHeader.mockReturnValue(
            NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
        );

        const response = await PUT(new Request("http://localhost/api/users/change-avatar/me"));
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: "Authorization header is required" });
    });

    it("forwards form-data payload to service when authorized", async () => {
        mocks.mockRequireAuthorizationHeader.mockReturnValue("Bearer token");
        mocks.mockForwardFormDataToUserService.mockResolvedValue(
            NextResponse.json({ status: 200, data: { avatarUrl: "/a.jpg" } }, { status: 200 })
        );

        const formData = new FormData();
        formData.append("avatar", new Blob(["x"], { type: "image/png" }), "avatar.png");

        const request = new Request("http://localhost/api/users/change-avatar/me", {
            method: "PUT",
            body: formData,
        });

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
