import { UserProfileDto, UpdateProfileDto, ChangePasswordDto } from "@/domain/user/dto/profile.dto";

export interface IUserRepository {
    getMe(): Promise<UserProfileDto>;
    updateMe(dto: UpdateProfileDto): Promise<UserProfileDto>;
    changeAvatar(file: File): Promise<{ avatarUrl: string }>;
    changePassword(dto: ChangePasswordDto): Promise<void>;
}
