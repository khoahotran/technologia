/**
 * Auth Repository
 *
 * Implements IAuthRepository with unified HTTP client.
 * Handles:
 * - Local login/register
 * - Google OAuth login
 * - Token refresh
 * - Password management
 * - Automatic response validation
 * - Secure token storage
 */

import {
    LoginDto,
    RegisterDto,
    RefreshTokenDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    GoogleLoginDto
} from "@/domain/user/dto/auth.dto";
import { IAuthRepository, AuthResponse } from "@/domain/user/repositories/auth.repository.interface";
import {
    LoginResponseSchema,
    RegisterResponseSchema,
    LogoutResponseSchema,
    ForgetPasswordResponseSchema,
    ResetPasswordResponseSchema,
    RefreshTokenResponseSchema,
} from "@/shared/validators/api-schemas";
import { fetchWithToken } from "@/infrastructure/http";
import { authStorage } from "@/infrastructure/persistence/storage";
import { createScopedLogger } from "@/lib/logger";

const logger = createScopedLogger('AuthRepository');
const BASE_URL = "/auth";

// ===========================================
// Helper Functions
// ===========================================

/**
 * Extract tokens from login/register response
 */
function extractTokens(fullResponse: unknown): AuthResponse {
    const response = LoginResponseSchema.parse(fullResponse);
    const data = response.data;

    // Store tokens in secure storage
    authStorage.setTokens(data.accessToken, data.refreshToken);

    return {
        token: data.accessToken,
        refreshToken: data.refreshToken,
        userId: String(data.userId),
    };
}

// ===========================================
// Auth Repository Implementation
// ===========================================

/**
 * Triển khai Auth Repository (Kho lưu trữ xác thực)
 *
 * Đối tượng này chịu trách nhiệm giao tiếp trực tiếp với Backend API về các vấn đề bảo mật.
 * Nó sử dụng 'fetchWithToken' để đảm bảo việc xử lý request đồng nhất.
 */
export const AuthRepository: IAuthRepository = {
    /**
     * Đăng nhập bằng tài khoản nội bộ (Username/Password)
     *
     * Sau khi đăng nhập thành công, token sẽ được tự động lưu vào secure storage (authStorage)
     */
    async login(dto: LoginDto): Promise<AuthResponse> {
        logger.debug('Attempting local login', { username: dto.username });

        // Gọi API login của server
        const response = await fetchWithToken(
            `${BASE_URL}/login/local`,
            {
                method: 'POST',
                body: dto,
                skipAuth: true, // Không cần đính kèm Bearer token cho request đăng nhập
            }
        );

        // Trích xuất token từ response và lưu trữ cho các request sau
        return extractTokens(response);
    },

    /**
     * Đăng nhập thông qua Google OAuth
     */
    async loginGoogle(dto: GoogleLoginDto): Promise<AuthResponse> {
        logger.debug('Attempting Google login');

        const response = await fetchWithToken(
            `${BASE_URL}/login/google`,
            {
                method: 'POST',
                body: dto,
                skipAuth: true,
            }
        );

        return extractTokens(response);
    },

    /**
     * Đăng ký tài khoản người dùng mới
     */
    async register(dto: RegisterDto): Promise<void> {
        logger.debug('Registering new user', { username: dto.username });

        await fetchWithToken(
            `${BASE_URL}/register/local`,
            {
                method: 'POST',
                body: dto,
                skipAuth: true,
            }
        );
    },

    /**
     * Đăng xuất và hủy bỏ phiên làm việc
     *
     * Quy trình: Gửi yêu cầu lên Server trước (Best effort), sau đó luôn xóa sạch Token ở Client.
     */
    async logout(refreshToken: string): Promise<void> {
        logger.debug('Logging out');

        try {
            // Bước 1: Thông báo cho Server để vô hiệu hóa Refresh Token trong DB
            await fetchWithToken(
                `${BASE_URL}/logout`,
                {
                    method: 'POST',
                    body: { refreshToken },
                    skipAuth: true, // Dùng skipAuth vì Access Token có thể đã hết hạn
                }
            );
        } catch (error) {
            // Nếu server gặp lỗi (ví dụ 500 hoặc rớt mạng), ta vẫn tiến hành Logout ở client
            logger.warn('Logout failed on server', { error: error instanceof Error ? error.message : String(error) });
        } finally {
            // Bước 2: Dù server có phản hồi thế nào, vẫn xóa sạch tokens ở LocalStorage/Cookies
            authStorage.clearTokens();
        }
    },

    /**
     * Làm mới Access Token bằng Refresh Token
     *
     * Thường được gọi bởi cơ chế 'Tự động Refresh' của fetchWithToken khi nhận lỗi 401
     */
    async refreshToken(dto: RefreshTokenDto): Promise<AuthResponse> {
        logger.debug('Refreshing access token');

        const response = await fetchWithToken(
            `${BASE_URL}/refresh-token`,
            {
                method: 'POST',
                body: dto,
                skipAuth: true,
            }
        );

        return extractTokens(response);
    },

    /**
     * Gửi yêu cầu khôi phục mật khẩu qua Email
     */
    async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
        logger.debug('Requesting password reset', { email: dto.email });

        await fetchWithToken(
            `${BASE_URL}/forget-password`,
            {
                method: 'POST',
                body: dto,
                skipAuth: true,
            }
        );
    },

    /**
     * Đặt lại mật khẩu mới bằng Code (Reset Token) nhận được từ Email
     */
    async resetPassword(dto: ResetPasswordDto): Promise<void> {
        logger.debug('Resetting password');

        await fetchWithToken(
            `${BASE_URL}/reset-password`,
            {
                method: 'POST',
                body: dto,
                skipAuth: true,
            }
        );
    }
};
