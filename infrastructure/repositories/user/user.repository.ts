/**
 * User Profile Repository
 *
 * Implements IUserRepository with unified HTTP client.
 * Handles:
 * - User profile fetching
 * - Profile updates
 * - Avatar changes  
 * - Password changes
 * - Automatic response validation
 */

import { UserProfileDto, UpdateProfileDto, ChangePasswordDto, UserProfileSchema } from "@/domain/user/dto/profile.dto";
import { IUserRepository } from "@/domain/user/repositories/user.repository.interface";
import {
    UserProfileResponseSchema,
    ChangeAvatarResponseSchema,
} from "@/shared/validators/api-schemas";
import { fetchWithToken } from "@/infrastructure/http";
import { createScopedLogger } from "@/lib/logger";

const logger = createScopedLogger('UserRepository');
const BASE_URL = "/users";

// ===========================================
// Helper Functions
// ===========================================

/**
 * Extract and validate user profile from response
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
