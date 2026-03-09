import { z } from 'zod';

/**
 * Auth User Entity
 */
export const AuthUserSchema = z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string(),
    role: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

/**
 * Auth Session (Tokens + User)
 */
export const AuthSessionSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: AuthUserSchema,
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

/**
 * Login Request / Response
 */
export const LoginRequestSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const GoogleLoginRequestSchema = z.object({
    idToken: z.string().min(1, 'ID Token is required'),
});

export type GoogleLoginRequest = z.infer<typeof GoogleLoginRequestSchema>;

export const BaseResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        status: z.number(),
        message: z.string(),
        data: dataSchema,
    });

export const LoginResponseSchema = BaseResponseSchema(
    z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        userId: z.union([z.string(), z.number()]).transform(String),
    })
);

export const RefreshTokenResponseSchema = BaseResponseSchema(
    z.object({
        accessToken: z.string().optional(),
        token: z.string().optional(),
        refreshToken: z.string().optional(),
    })
);
