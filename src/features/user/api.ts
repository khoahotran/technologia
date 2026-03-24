import {
    ChangePasswordSchema,
    UpdateProfileSchema,
    UserProfileSchema,
    type ChangePassword,
    type UpdateProfile,
    type UserProfile,
} from "./types";

import { get, put } from "@/api/client";
import type { ApiResponse } from "@/types";

export async function getProfile(): Promise<UserProfile> {
    const response = await get<ApiResponse<UserProfile>>('/api/users/profile/me');
    return UserProfileSchema.parse(response.data);
}

export async function updateProfile(data: UpdateProfile): Promise<UserProfile> {
    const payload = UpdateProfileSchema.parse(data);
    const response = await put<ApiResponse<UserProfile>>('/api/users/profile/me', payload);
    return UserProfileSchema.parse(response.data);
}

export async function changePassword(data: ChangePassword): Promise<void> {
    await put('/api/users/change-password/me', ChangePasswordSchema.parse(data));
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file); // Field name should be 'avatar' as per docs
    const response = await put<ApiResponse<{ avatarUrl: string }>>('/api/users/change-avatar/me', formData);
    return response.data;
}
