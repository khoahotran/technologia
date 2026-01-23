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
        const { data } = await httpClient.post(`${BASE_URL}/login`, dto);
        // Postman response: { status: 200, data: { accessToken, refreshToken, userId }, ... }
        // The interface expects token (accessToken)
        return {
            token: data.data.accessToken || data.data.token, // Handle both cases just in case
            refreshToken: data.data.refreshToken,
            userId: data.data.userId
        };
    },

    loginGoogle: async (dto: GoogleLoginDto): Promise<AuthResponse> => {
        const { data } = await httpClient.post(`${BASE_URL}/login/google`, dto);
        return {
            token: data.data.token, // Postman example returns 'token' not 'accessToken'
            refreshToken: data.data.refreshToken,
            userId: data.data.userId
        };
    },

    register: async (dto: RegisterDto): Promise<void> => {
        await httpClient.post(`${BASE_URL}/register`, dto);
    },

    logout: async (refreshToken: string): Promise<void> => {
        await httpClient.post(`${BASE_URL}/logout`, { refreshToken });
    },

    refreshToken: async (dto: RefreshTokenDto): Promise<AuthResponse> => {
        const { data } = await httpClient.post(`${BASE_URL}/refresh-token`, dto);
        return {
            token: data.data.accessToken || data.data.token,
            refreshToken: data.data.refreshToken,
            userId: data.data.userId
        };
    },

    forgotPassword: async (dto: ForgotPasswordDto): Promise<void> => {
        await httpClient.post(`${BASE_URL}/forget-password`, dto);
    },

    resetPassword: async (dto: ResetPasswordDto): Promise<void> => {
        await httpClient.post(`${BASE_URL}/reset-password`, dto);
    }
};
