import type { GoogleLoginInput } from "@/src/domain/models/auth.model";
import { authGatewayRepository } from "@/src/infrastructure/repositories/auth.gateway.repository";
import { userGatewayRepository } from "@/src/infrastructure/repositories/user.gateway.repository";
import { authSessionService } from "@/src/application/services/auth-session.service";

export async function googleLoginUseCase(payload: GoogleLoginInput) {
  const auth = await authGatewayRepository.loginGoogle(payload);
  const profile = await userGatewayRepository.getMe();

  authSessionService.save({
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    user: {
      userId: String(profile.userId),
      username: profile.username,
      email: profile.email ?? "",
      role: profile.role ?? "CUSTOMER",
    },
  });

  return {
    token: auth.accessToken,
    refreshToken: auth.refreshToken,
    userId: auth.userId,
  };
}
