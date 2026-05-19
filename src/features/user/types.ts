import { z } from 'zod';

export const UserProfileSchema = z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string(),
    displayName: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    role: z.string().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email().optional(),
    displayName: z.string().optional(),
    phoneNumber: z.string(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const UpdateProfileApiRequestSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email().optional(),
    displayName: z.string().optional(),
    phoneNumber: z.string(),
});

export type UpdateProfileApiRequest = z.infer<typeof UpdateProfileApiRequestSchema>;

export const ChangePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
});

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
