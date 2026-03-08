import { authStorage } from "@/infrastructure/persistence/storage";
import type { AuthSession, AuthSessionUser } from "@/src/domain/entities/auth-session";
import { useAuthSessionStore } from "@/src/store/auth-session.store";

export const authSessionService = {
  save(session: AuthSession) {
    authStorage.setTokens(session.accessToken, session.refreshToken);
    useAuthSessionStore.getState().setSession(session);
  },

  clear() {
    authStorage.clearTokens();
    useAuthSessionStore.getState().clearSession();
  },

  hydrateSessionTokens(user: AuthSessionUser): AuthSession | null {
    const accessToken = authStorage.getAccessToken();
    const refreshToken = authStorage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    const session: AuthSession = {
      accessToken,
      refreshToken,
      user,
    };

    useAuthSessionStore.getState().setSession(session);
    return session;
  },
};
