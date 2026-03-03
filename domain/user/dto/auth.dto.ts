import { z } from "zod";

/** Bản phác thảo cho dữ liệu Đăng nhập (Login Payload) */
export const LoginSchema = z.object({
    /** Tên đăng nhập (bắt buộc) */
    username: z.string(),
    /** Mật khẩu (bắt buộc) */
    password: z.string(),
});
export type LoginDto = z.infer<typeof LoginSchema>;

/** Bản phác thảo cho dữ liệu Đăng ký người dùng mới (Registration Payload) */
export const RegisterSchema = z.object({
    /** Tên đăng nhập mong muốn */
    username: z.string(),
    /** Mật khẩu thô */
    password: z.string(),
    /** Email liên lạc (kiểm lỗi định dạng nghiêm ngặt) */
    email: z.string().email().optional(),
    /** Số điện thoại (tùy chọn) */
    phoneNumber: z.string().optional(),
    /** Tên (tùy chọn) */
    firstname: z.string().optional(),
    /** Họ và tên đệm (tùy chọn) */
    lastname: z.string().optional(),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

/** Bản phác thảo dùng để yêu cầu cấp lại Access Token mới (Refresh Token Flow) */
export const RefreshTokenSchema = z.object({
    /** ChuỗiRefresh token (thường là JWT hoặc định dạng Base64) */
    refreshToken: z.string()
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;


/** Bản phác thảo cho yêu cầu khôi phục mật khẩu qua email */
export const ForgotPasswordSchema = z.object({
    /** Địa chỉ email đăng ký tài khoản cần nhận liên kết đặt lại mật khẩu */
    email: z.string().email()
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

/** Bản phác thảo cho việc thiết lập mật khẩu mới sau khi xác thực token */
export const ResetPasswordSchema = z.object({
    /** Mã token duy nhất được tạo ra từ luồng Quên mật khẩu */
    resetToken: z.string(),
    /** Mật khẩu mới cần thiết lập */
    newPassword: z.string()
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

/** Bản phác thảo cho dữ liệu phản hồi từ việc đăng nhập qua Google OAuth */
export const GoogleLoginSchema = z.object({
    /** Token danh tính (ID Token) do Google cấp */
    idToken: z.string()
});
export type GoogleLoginDto = z.infer<typeof GoogleLoginSchema>;
