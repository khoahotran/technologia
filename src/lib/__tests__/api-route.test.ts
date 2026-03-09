import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  forwardFormDataToUserService,
  forwardJsonToUserService,
  requireAuthorizationHeader,
} from "../api-route";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("api-route utilities", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("requireAuthorizationHeader returns unauthorized response when header is missing", async () => {
    const request = new Request("http://localhost/api/test");
    const result = requireAuthorizationHeader(request);

    expect(typeof result).not.toBe("string");
    if (typeof result !== "string") {
      expect(result.status).toBe(401);
      expect(await result.json()).toEqual({
        error: "Authorization header (Bearer token) is required",
      });
    }
  });

  it("forwardJsonToUserService proxies success responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 200, data: { ok: true } }),
    });

    const response = await forwardJsonToUserService({
      path: "/api/auth/register/local",
      method: "POST",
      body: { username: "u" },
      fallbackError: "Registration failed",
      logLabel: "Register",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8081/api/auth/register/local",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 200, data: { ok: true } });
  });

  it("forwardJsonToUserService maps backend error messages", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Bad input" }),
    });

    const response = await forwardJsonToUserService({
      path: "/api/auth/reset-password",
      method: "POST",
      body: { resetToken: "x", newPassword: "y" },
      fallbackError: "Password reset failed",
      logLabel: "Reset Password",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Bad input" });
  });

  it("forwardFormDataToUserService proxies multipart requests", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 200, data: { avatarUrl: "/a.jpg" } }),
    });

    const formData = new FormData();
    formData.append("avatar", new Blob(["x"], { type: "image/png" }), "avatar.png");

    const response = await forwardFormDataToUserService({
      path: "/api/users/change-avatar/me",
      method: "PUT",
      formData,
      authHeader: "Bearer token",
      fallbackError: "Failed to change avatar",
      logLabel: "Change Avatar",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8081/api/users/change-avatar/me",
      expect.objectContaining({
        method: "PUT",
        headers: { Authorization: "Bearer token" },
        body: formData,
      })
    );
    expect(response.status).toBe(200);
  });
});
