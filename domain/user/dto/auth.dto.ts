import { z } from "zod";

export const LoginSchema = z.object({
    username: z.string(),
    password: z.string(),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const RefreshTokenSchema = z.object({
    refreshToken: z.string()
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;


export const ForgotPasswordSchema = z.object({
    email: z.string().email()
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
    resetToken: z.string(),
    newPassword: z.string()
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export const GoogleLoginSchema = z.object({
    idToken: z.string()
});
export type GoogleLoginDto = z.infer<typeof GoogleLoginSchema>;
