import { describe, expect, it, vi } from "vitest";

import { loginUseCase } from "@/src/application/use-cases/login.use-case";

const loginLocalMock = vi.fn();
const getMeMock = vi.fn();
const saveSessionMock = vi.fn();

vi.mock("@/src/infrastructure/repositories/auth.gateway.repository", () => ({
  authGatewayRepository: {
    loginLocal: loginLocalMock,
  },
}));

vi.mock("@/src/infrastructure/repositories/user.gateway.repository", () => ({
  userGatewayRepository: {
    getMe: getMeMock,
  },
}));

vi.mock("@/src/application/services/auth-session.service", () => ({
  authSessionService: {
    save: saveSessionMock,
  },
}));

describe("loginUseCase", () => {
  it("logs in through gateway repository and persists hydrated auth session", async () => {
    loginLocalMock.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      userId: "u-1",
    });

    getMeMock.mockResolvedValue({
      userId: "u-1",
      username: "alice",
      email: "alice@example.com",
      role: "CUSTOMER",
    });

    const result = await loginUseCase({
      username: "alice",
      password: "secret",
    });

    expect(loginLocalMock).toHaveBeenCalledWith({
      username: "alice",
      password: "secret",
    });
    expect(getMeMock).toHaveBeenCalledTimes(1);
    expect(saveSessionMock).toHaveBeenCalledWith({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
        userId: "u-1",
        username: "alice",
        email: "alice@example.com",
        role: "CUSTOMER",
      },
    });
    expect(result).toEqual({
      token: "access-token",
      refreshToken: "refresh-token",
      userId: "u-1",
    });
  });
});
