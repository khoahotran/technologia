import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// mocks for createDynamicApiHandler helpers
const mocks = vi.hoisted(() => ({
    mockCreateDynamicApiHandler: vi.fn(),
}));

vi.mock("@/lib/api-handler", () => ({
    createDynamicApiHandler: mocks.mockCreateDynamicApiHandler,
}));

// re-import after mocking
import "./route"; // just load the module so it registers


describe("DELETE /api/cart-items/delete/[id] route", () => {
    it("registers a DELETE handler pointing at the correct cart service path", () => {
        expect(mocks.mockCreateDynamicApiHandler).toHaveBeenCalledWith({
            targetService: "cart",
            path: expect.any(Function),
            requiresAuth: true,
        });

        // verify the generated path function builds the expected string
        const calledConfig = mocks.mockCreateDynamicApiHandler.mock.calls[0][0];
        const pathFn = calledConfig.path as (params: { id: string }) => string;
        expect(pathFn({ id: "123" })).toBe("/api/cart-items/delete/123");
    });
});