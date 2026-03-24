import { z } from 'zod';

export const UserProfileSchema = z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string(),
    displayName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    imageUrl: z.string().optional(),
    role: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
});

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
