import type { GoogleLoginDto } from "@/domain/user/dto/auth.dto";
import { AuthRepository } from "@/infrastructure/repositories/auth/auth.repository";
import { UserRepository } from "@/infrastructure/repositories/user/user.repository";
import { authSessionService } from "@/src/application/services/auth-session.service";

export async function googleLoginUseCase(payload: GoogleLoginDto) {
  const auth = await AuthRepository.loginGoogle(payload);
  const profile = await UserRepository.getMe();

  authSessionService.save({
    accessToken: auth.token,
    refreshToken: auth.refreshToken,
    user: {
      userId: String(profile.userId),
      username: profile.username,
      email: profile.email ?? "",
      role: profile.role ?? "CUSTOMER",
    },
  });

  return auth;
}
