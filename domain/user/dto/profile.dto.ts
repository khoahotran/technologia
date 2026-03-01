import { z } from "zod";


export const UserProfileSchema = z.object({
    userId: z.union([z.string(), z.number()]),
    username: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string().email(),
    phoneNumber: z.string().nullable(),
    imageUrl: z.string().nullable(),
    displayName: z.string().nullable(),
    role: z.string().optional()
});
export type UserProfileDto = z.infer<typeof UserProfileSchema>;

export const UpdateProfileSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(), // Postman shows string for phone number update
    displayName: z.string()
});
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string()
});
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
