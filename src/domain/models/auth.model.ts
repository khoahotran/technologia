import { z } from "zod";

export const loginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const googleLoginInputSchema = z.object({
  idToken: z.string().min(1),
});

export const refreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1),
});

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  userId: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginInputSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenInputSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
