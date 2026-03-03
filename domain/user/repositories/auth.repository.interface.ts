import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, GoogleLoginDto } from "@/domain/user/dto/auth.dto";

/** Dữ liệu phản hồi chuẩn sau khi xác thực thành công */
export interface AuthResponse {
    /** JWT Access Token dùng cho các request tiếp theo */
    token: string;
    /** JWT Refresh Token dùng để cấp lại access token khi hết hạn */
    refreshToken: string;
    /** Mã định danh duy nhất của người dùng đã đăng nhập */
    userId: number | string;
}

/** 
 * Giao diện Repository (Contract) cho các nghiệp vụ Xác thực.
 * Giúp tách biệt giao diện người dùng (UI) khỏi logic gọi API thực tế.
 */
export interface IAuthRepository {
    /** 
     * Đăng nhập bằng tên người dùng và mật khẩu.
     */
    login(dto: LoginDto): Promise<AuthResponse>;

    /** 
     * Đăng nhập thông qua hệ thống Google OAuth.
     */
    loginGoogle(dto: GoogleLoginDto): Promise<AuthResponse>;

    /** 
     * Đăng ký tài khoản người dùng mới.
     */
    register(dto: RegisterDto): Promise<void>;

    /** 
     * Đăng xuất: Vô hiệu hóa token trên server.
     * @param refreshToken Token cần thu hồi.
     */
    logout(refreshToken: string): Promise<void>;

    /** 
     * Cấp lại access token mới bằng refresh token hợp lệ.
     */
    refreshToken(dto: RefreshTokenDto): Promise<AuthResponse>;

    /** 
     * Gửi yêu cầu khôi phục mật khẩu qua email.
     */
    forgotPassword(dto: ForgotPasswordDto): Promise<void>;

    /** 
     * Thiết lập mật khẩu mới sau khi xác thực token thành công.
     */
    resetPassword(dto: ResetPasswordDto): Promise<void>;
}

