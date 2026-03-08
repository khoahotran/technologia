import type { IAuthRepository } from "@/src/domain/repositories/auth.repository";
import type {
  AuthTokens,
  GoogleLoginInput,
  LoginInput,
  RefreshTokenInput,
} from "@/src/domain/models/auth.model";
import { requestAndValidate } from "@/src/infrastructure/api/api-client";
import {
  createBaseResponseSchema,
  loginResponseSchema,
  refreshResponseSchema,
} from "@/src/infrastructure/api/schemas";
import { useAuthSessionStore } from "@/src/store/auth-session.store";
import { z } from "zod";

const logoutResponseSchema = createBaseResponseSchema(z.unknown());

export const authGatewayRepository: IAuthRepository = {
  async loginLocal(payload: LoginInput): Promise<AuthTokens> {
    const response = await requestAndValidate(
      {
        url: "/api/auth/login/local",
        method: "POST",
        data: payload,
        skipAuth: true,
      },
      loginResponseSchema
    );

    return response.data;
  },

  async loginGoogle(payload: GoogleLoginInput): Promise<AuthTokens> {
    const response = await requestAndValidate(
      {
        url: "/api/auth/login/google",
        method: "POST",
        data: payload,
        skipAuth: true,
      },
      loginResponseSchema
    );

    return response.data;
  },

  async refreshToken(payload: RefreshTokenInput): Promise<AuthTokens> {
    const response = await requestAndValidate(
      {
        url: "/api/auth/refresh-token",
        method: "POST",
        data: payload,
        skipAuth: true,
      },
      refreshResponseSchema
    );

    const currentUserId = useAuthSessionStore.getState().session?.user.userId;

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken ?? payload.refreshToken,
      userId: currentUserId ?? "unknown",
    };
  },

  async logout(payload: RefreshTokenInput): Promise<void> {
    await requestAndValidate(
      {
        url: "/api/auth/logout",
        method: "POST",
        data: payload,
        skipAuth: true,
      },
      logoutResponseSchema
    );
  },
};
