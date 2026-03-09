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
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    displayName: z.string().optional(),
    phoneNumber: z.string().optional(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
});

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
