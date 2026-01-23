import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, GoogleLoginDto } from "@/domain/user/dto/auth.dto";

export interface AuthResponse {
    token: string;
    refreshToken: string;
    userId: number;
}

export interface IAuthRepository {
    login(dto: LoginDto): Promise<AuthResponse>;
    loginGoogle(dto: GoogleLoginDto): Promise<AuthResponse>;
    register(dto: RegisterDto): Promise<void>;
    logout(refreshToken: string): Promise<void>;
    refreshToken(dto: RefreshTokenDto): Promise<AuthResponse>;
    forgotPassword(dto: ForgotPasswordDto): Promise<void>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
}
