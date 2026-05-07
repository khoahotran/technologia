import {
    ChangePasswordSchema,
    UpdateProfileSchema,
    UpdateProfileApiRequestSchema,
    UserProfileSchema,
    type ChangePassword,
    type UpdateProfile,
    type UpdateProfileApiRequest,
    type UserProfile,
} from "./types";

import { get, put } from "@/api/client";
import type { ApiResponse } from "@/types";

export async function getProfile(): Promise<UserProfile> {
    const response = await get<ApiResponse<UserProfile>>('/api/users/profile/me');
    return UserProfileSchema.parse(response.data);
}

export async function updateProfile(data: UpdateProfile): Promise<void> {
    const payload = UpdateProfileSchema.parse(data);
    const requestBody: UpdateProfileApiRequest = UpdateProfileApiRequestSchema.parse({
        firstname: payload.firstName,
        lastname: payload.lastName,
        email: payload.email,
        displayName: payload.displayName,
        phoneNumber: payload.phoneNumber,
    });
    await put('/api/users/profile/me', requestBody);
}

export async function changePassword(data: ChangePassword): Promise<void> {
    const payload = ChangePasswordSchema.parse(data);
    await put('/api/users/change-password/me', {
        oldPassword: payload.oldPassword,
        newPassword: payload.newPassword,
    });
}

export async function uploadAvatar(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('avatar', file);
    await put('/api/users/change-avatar/me', formData);
}
