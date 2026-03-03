import { UserProfileDto, UpdateProfileDto, ChangePasswordDto } from "@/domain/user/dto/profile.dto";

/**
 * Giao diện Repository (Contract) cho việc quản lý thông tin Người dùng.
 * Thường tương tác với User Service (Port 8081).
 */
export interface IUserRepository {
    /** Lấy thông tin hồ sơ của người dùng đang đăng nhập hiện tại */
    getMe(): Promise<UserProfileDto>;

    /** 
     * Cập nhật thông tin chi tiết của hồ sơ cá nhân.
     */
    updateMe(dto: UpdateProfileDto): Promise<UserProfileDto>;

    /** 
     * Tải lên và thay đổi ảnh đại diện cá nhân.
     * @param file File ảnh thô từ phía client.
     */
    changeAvatar(file: File): Promise<{ avatarUrl: string }>;

    /** 
     * Thực hiện thay đổi mật khẩu tài khoản.
     */
    changePassword(dto: ChangePasswordDto): Promise<void>;
}

