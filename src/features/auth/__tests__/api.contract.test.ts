import { beforeEach, describe, expect, it, vi } from "vitest";

import { register, resetPassword } from "@/features/auth/api";

const postMock = vi.fn();

vi.mock("@/api/client", () => ({
    post: (...args: unknown[]) => postMock(...args),
}));

describe("auth api contract", () => {
    beforeEach(() => {
        postMock.mockReset();
    });

    it("calls register local endpoint with firstName/lastName payload", async () => {
        postMock.mockResolvedValue({ status: 200, message: "ok", data: {} });

        await register({
            username: "demo",
            password: "123456",
            email: "demo@test.com",
            phoneNumber: "0123",
            firstName: "A",
            lastName: "B",
        });

        expect(postMock).toHaveBeenCalledWith("/api/auth/register/local", {
            username: "demo",
            password: "123456",
            email: "demo@test.com",
            phoneNumber: "0123",
            firstName: "A",
            lastName: "B",
        });
    });

    it("calls reset password with resetToken field", async () => {
        postMock.mockResolvedValue({ status: 200, message: "ok", data: null });

        await resetPassword({ resetToken: "rt-1", newPassword: "new-password" });

        expect(postMock).toHaveBeenCalledWith("/api/auth/reset-password", {
            resetToken: "rt-1",
            newPassword: "new-password",
        });
    });
});

