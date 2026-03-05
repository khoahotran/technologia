/**
 * Triển khai User Repository (User Profile Repository Implementation)
 *
 * Triển khai `IUserRepository` sử dụng HTTP client thống nhất (fetchWithToken).
 * Chịu trách nhiệm cho tất cả các thao tác liên quan đến hồ sơ người dùng:
 * - Lấy thông tin hồ sơ cá nhân
 * - Cập nhật thông tin hồ sơ
 * - Thay đổi ảnh đại diện (Avatar)
 * - Thay đổi mật khẩu
 * - Tự động xác thực Response bằng Zod Schema
 */

import { UserProfileDto, UpdateProfileDto, ChangePasswordDto, UserProfileSchema } from "@/domain/user/dto/profile.dto";
import { IUserRepository } from "@/domain/user/repositories/user.repository.interface";
import { fetchWithToken } from "@/infrastructure/http";
import { createScopedLogger } from "@/lib/logger";
import {
    UserProfileResponseSchema,
    ChangeAvatarResponseSchema,
} from "@/shared/validators/api-schemas";

const logger = createScopedLogger('UserRepository');
/** Đường dẫn gốc API cho tài nguyên User */
const BASE_URL = "/users";

// ===========================================
// Helper Functions
// ===========================================

/**
 * Trích xuất và xác thực dữ liệu UserProfile từ response API
 * @param response Response thô từ API
 * @returns UserProfileDto đã được xác thực kiểu với Zod
 */
function extractUserProfile(response: unknown): UserProfileDto {
    const validated = UserProfileResponseSchema.parse(response);
    return UserProfileSchema.parse(validated.data);
}

// ===========================================
// User Repository Implementation
// ===========================================

/**
 * Triển khai User Repository
 *
 * Quản lý thông tin hồ sơ (profile) của người dùng, cập nhật thông tin cá nhân,
 * thay đổi ảnh đại diện (avatar) và quản lý mật khẩu.
 */
export const UserRepository: IUserRepository = {
    /**
     * Lấy thông tin hồ sơ của người dùng hiện tại (dựa trên Access Token)
     * Token được đính kèm tự động trong Header bởi fetchWithToken.
     */
    async getMe(): Promise<UserProfileDto> {
        logger.debug('Fetching user profile');

        const response = await fetchWithToken(
            `${BASE_URL}/profile/me`,
            { method: 'GET' }
        );

        // Trích xuất và xác thực dữ liệu hồ sơ từ API response
        return extractUserProfile(response);
    },

    /**
     * Cập nhật thông tin hồ sơ cá nhân
     * Chấp nhận các thay đổi về tên, email, số điện thoại, v.v.
     * @param dto Dữ liệu cần cập nhật (có thể là partial)
     */
    async updateMe(dto: UpdateProfileDto): Promise<UserProfileDto> {
        logger.debug('Updating user profile');

        const response = await fetchWithToken(
            `${BASE_URL}/profile/me`,
            {
                method: 'PUT',
                body: dto,
            }
        );

        return extractUserProfile(response);
    },

    /**
     * Thay đổi ảnh đại diện của người dùng
     *
     * Sử dụng FormData để gửi dữ liệu file nhị phân (binary).
     * Lưu ý: Không tự ý thiết lập 'Content-Type' header khi gửi FormData,
     * trình duyệt sẽ tự động thiết lập kèm theo 'boundary' cần thiết.
     *
     * @param file File ảnh từ input của người dùng
     * @returns Object chứa URL của avatar mới
     */
    async changeAvatar(file: File): Promise<{ avatarUrl: string }> {
        logger.debug('Changing avatar');

        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetchWithToken(
            `${BASE_URL}/change-avatar/me`,
            {
                method: 'PUT',
                body: formData,
                headers: {
                    // Header tùy chỉnh để backend nhận diện request upload (nếu cần)
                    'X-File-Upload': 'true',
                },
            }
        );

        const validated = ChangeAvatarResponseSchema.parse(response);
        return validated.data;
    },

    /**
     * Thay đổi mật khẩu đăng nhập
     * Yêu cầu xác thực bằng mật khẩu cũ trước khi đặt mật khẩu mới.
     * @param dto Chứa oldPassword (để xác thực) và newPassword (mật khẩu mới)
     */
    async changePassword(dto: ChangePasswordDto): Promise<void> {
        logger.debug('Changing password');

        await fetchWithToken(
            `${BASE_URL}/change-password/me`,
            {
                method: 'PUT',
                body: {
                    oldPassword: dto.oldPassword,
                    newPassword: dto.newPassword,
                },
            }
        );
    }
};
