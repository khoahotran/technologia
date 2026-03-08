import { authStorage } from "@/infrastructure/persistence/storage";
import { AuthRepository } from "@/infrastructure/repositories/auth/auth.repository";
import { authSessionService } from "@/src/application/services/auth-session.service";

export async function logoutUseCase() {
  const refreshToken = authStorage.getRefreshToken();

  if (refreshToken) {
    await AuthRepository.logout(refreshToken);
  }

  authSessionService.clear();
}
