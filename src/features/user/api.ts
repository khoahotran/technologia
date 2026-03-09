import type { ChangePassword, UpdateProfile, UserProfile } from "./types";

import { get, put } from "@/api/client";
import type { ApiResponse } from "@/types";

export async function getProfile(): Promise<UserProfile> {
    const response = await get<ApiResponse<UserProfile>>('/api/users/profile/me');
    return response.data;
}

export async function updateProfile(data: UpdateProfile): Promise<UserProfile> {
    const response = await put<ApiResponse<UserProfile>>('/api/users/profile/me', data);
    return response.data;
}

export async function changePassword(data: ChangePassword): Promise<void> {
    await put('/api/users/change-password/me', data);
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file); // Field name should be 'avatar' as per docs
    const response = await put<ApiResponse<{ avatarUrl: string }>>('/api/users/change-avatar/me', formData);
    return response.data;
}
