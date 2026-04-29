import {
  ForgotPasswordRequestSchema,
  LoginResponseSchema,
  RegisterLocalRequestSchema,
  RefreshTokenResponseSchema,
  ResetPasswordRequestSchema,
  type AuthSession,
  type ForgotPasswordRequest,
  type GoogleLoginRequest,
  type LoginRequest,
  type RegisterLocalRequest,
  type ResetPasswordRequest,
} from "./types";

import { post } from "@/api/client";

export async function googleLogin(request: GoogleLoginRequest): Promise<AuthSession> {
  const response = await post<unknown>("/api/auth/login/google", request);
  const parsed = LoginResponseSchema.parse(response);

  return {
    accessToken: parsed.data.accessToken,
    refreshToken: parsed.data.refreshToken,
    user: {
      userId: parsed.data.userId,
      username: "Google User",
      email: "",
      role: "CUSTOMER",
    },
  };
}

export async function login(credentials: LoginRequest): Promise<AuthSession> {
  const response = await post<unknown>("/api/auth/login/local", credentials);
  const parsed = LoginResponseSchema.parse(response);

  return {
    accessToken: parsed.data.accessToken,
    refreshToken: parsed.data.refreshToken,
    user: {
      userId: parsed.data.userId,
      username: credentials.username,
      email: "",
      role: "CUSTOMER",
    },
  };
}

export async function register(data: {
  username: string;
  password: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const payload: RegisterLocalRequest = RegisterLocalRequestSchema.parse(data);
  return post("/api/auth/register/local", payload);
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await post("/api/auth/forget-password", ForgotPasswordRequestSchema.parse(data));
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await post("/api/auth/reset-password", ResetPasswordRequestSchema.parse(data));
}

export async function logout(refreshToken: string): Promise<void> {
  await post("/api/auth/logout", { refreshToken });
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await post<unknown>("/api/auth/refresh-token", { refreshToken });
  const parsed = RefreshTokenResponseSchema.parse(response);

  return {
    accessToken: parsed.data.accessToken,
    refreshToken: parsed.data.refreshToken,
  };
}
