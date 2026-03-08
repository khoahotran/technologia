import type {
  AuthTokens,
  GoogleLoginInput,
  LoginInput,
  RefreshTokenInput,
} from "@/src/domain/models/auth.model";

export interface IAuthRepository {
  loginLocal(payload: LoginInput): Promise<AuthTokens>;
  loginGoogle(payload: GoogleLoginInput): Promise<AuthTokens>;
  refreshToken(payload: RefreshTokenInput): Promise<AuthTokens>;
  logout(payload: RefreshTokenInput): Promise<void>;
}
