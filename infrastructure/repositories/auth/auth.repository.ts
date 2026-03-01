import {
    LoginDto,
    RegisterDto,
    RefreshTokenDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    GoogleLoginDto
} from "@/domain/user/dto/auth.dto";
import { IAuthRepository, AuthResponse } from "@/domain/user/repositories/auth.repository.interface";
import { httpClient } from "@/infrastructure/http/client";

const BASE_URL = "/auth";

export const AuthRepository: IAuthRepository = {
    login: async (dto: LoginDto): Promise<AuthResponse> => {
        // API: /api/auth/login/local
        const { data } = await httpClient.post(`${BASE_URL}/login/local`, dto);
        const result = data.data || {};
        return {
            token: result.accessToken || result.token || "",
            refreshToken: result.refreshToken || "",
            userId: result.userId || ""
        };
    },

    loginGoogle: async (dto: GoogleLoginDto): Promise<AuthResponse> => {
        // API: /api/auth/login/google
        const { data } = await httpClient.post(`${BASE_URL}/login/google`, dto);
        const result = data.data || {};
        return {
            token: result.token || result.accessToken || "",
            refreshToken: result.refreshToken || "",
            userId: result.userId || ""
        };
    },

    register: async (dto: RegisterDto): Promise<void> => {
        // API: /api/auth/register/local
        await httpClient.post(`${BASE_URL}/register/local`, dto);
    },

    logout: async (refreshToken: string): Promise<void> => {
        await httpClient.post(`${BASE_URL}/logout`, { refreshToken });
    },

    refreshToken: async (dto: RefreshTokenDto): Promise<AuthResponse> => {
        const { data } = await httpClient.post(`${BASE_URL}/refresh-token`, dto);
        const result = data.data || {};
        return {
            token: result.accessToken || result.token || "",
            refreshToken: result.refreshToken || "",
            userId: result.userId || ""
        };
    },

    forgotPassword: async (dto: ForgotPasswordDto): Promise<void> => {
        await httpClient.post(`${BASE_URL}/forget-password`, dto);
    },

    resetPassword: async (dto: ResetPasswordDto): Promise<void> => {
        await httpClient.post(`${BASE_URL}/reset-password`, dto);
    }
};
