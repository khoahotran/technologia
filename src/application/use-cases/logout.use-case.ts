import { authStorage } from "@/infrastructure/persistence/storage";
import { authSessionService } from "@/src/application/services/auth-session.service";
import { authGatewayRepository } from "@/src/infrastructure/repositories/auth.gateway.repository";

export async function logoutUseCase() {
  const refreshToken = authStorage.getRefreshToken();

  if (refreshToken) {
    await authGatewayRepository.logout({ refreshToken });
  }

  authSessionService.clear();
}
