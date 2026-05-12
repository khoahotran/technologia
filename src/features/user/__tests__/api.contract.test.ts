import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
} from "@/features/user/api";

const getMock = vi.fn();
const putMock = vi.fn();

vi.mock("@/api/client", () => ({
    get: (...args: unknown[]) => getMock(...args),
    put: (...args: unknown[]) => putMock(...args),
}));

const mockProfileData = {
    userId: "uuid-1",
    username: "john_doe",
    email: "john@test.com",
    displayName: "John Doe",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "0123456789",
    imageUrl: "https://example.com/avatar.jpg",
    role: "CUSTOMER",
};

describe("user api contract", () => {
    beforeEach(() => {
        getMock.mockReset();
        putMock.mockReset();
    });

    it("getProfile calls GET /api/users/profile/me", async () => {
        getMock.mockResolvedValue({ status: 200, message: "ok", data: mockProfileData });

        const result = await getProfile();

        expect(getMock).toHaveBeenCalledWith("/api/users/profile/me");
        expect(result).toEqual(mockProfileData);
    });

    it("updateProfile calls PUT /api/users/profile/me with mapped body", async () => {
        putMock.mockResolvedValue({ status: 200, message: "ok", data: mockProfileData });

        await updateProfile({
            firstName: "John",
            lastName: "Doe",
            email: "john@test.com",
            displayName: "John Doe",
            phoneNumber: "0123456789",
        });

        expect(putMock).toHaveBeenCalledWith("/api/users/profile/me", {
            firstname: "John",
            lastname: "Doe",
            email: "john@test.com",
            displayName: "John Doe",
            phoneNumber: "0123456789",
        });
    });

    it("updateProfile sends partial fields when optional values omitted", async () => {
        putMock.mockResolvedValue({ status: 200, message: "ok", data: {} });

        await updateProfile({
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "0123456789",
        });

        expect(putMock).toHaveBeenCalledWith("/api/users/profile/me", {
            firstname: "John",
            lastname: "Doe",
            phoneNumber: "0123456789",
        });
    });

    it("changePassword calls PUT /api/users/change-password/me", async () => {
        putMock.mockResolvedValue({ status: 200, message: "ok", data: null });

        await changePassword({
            oldPassword: "old-pass",
            newPassword: "new-pass",
            confirmPassword: "new-pass",
        });

        expect(putMock).toHaveBeenCalledWith("/api/users/change-password/me", {
            oldPassword: "old-pass",
            newPassword: "new-pass",
        });
    });

    it("uploadAvatar calls PUT /api/users/change-avatar/me with FormData", async () => {
        putMock.mockResolvedValue({ status: 200, message: "ok", data: {} });
        const file = new File(["avatar"], "avatar.png", { type: "image/png" });

        await uploadAvatar(file);

        expect(putMock).toHaveBeenCalledTimes(1);
        expect(putMock).toHaveBeenCalledWith(
            "/api/users/change-avatar/me",
            expect.any(FormData)
        );
        const formData = putMock.mock.calls[0]?.[1] as FormData;
        expect(formData?.get("avatar")).toEqual(file);
    });
});
