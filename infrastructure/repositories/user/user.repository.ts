import { IUserRepository } from "@/domain/user/repositories/user.repository.interface";
import { UserProfileDto, UpdateProfileDto, ChangePasswordDto, UserProfileSchema } from "@/domain/user/dto/profile.dto";
import { httpClient } from "@/infrastructure/http/client";

const BASE_URL = "/users";

export const UserRepository: IUserRepository = {
    getMe: async (): Promise<UserProfileDto> => {
        const { data } = await httpClient.get(`${BASE_URL}/profile/me`);
        return UserProfileSchema.parse(data.data);
    },

    updateMe: async (dto: UpdateProfileDto): Promise<UserProfileDto> => {
        const { data } = await httpClient.put(`${BASE_URL}/profile/me`, dto);
        return UserProfileSchema.parse(data.data);
    },

    changeAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
        const formData = new FormData();
        formData.append('avatar', file);

        const { data } = await httpClient.put(`${BASE_URL}/change-avatar/me`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data.data;
    },

    changePassword: async (dto: ChangePasswordDto): Promise<void> => {
        await httpClient.put(`${BASE_URL}/change-password/me`, dto);
    }
};
