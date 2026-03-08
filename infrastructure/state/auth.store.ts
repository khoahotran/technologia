import type { AuthStore, UserProfile } from "./store.types";

import { useAuthSessionStore } from "@/src/store/auth-session.store";


export const useAuthStore = useAuthSessionStore;

export const selectCurrentUser = (state: { session: { user: UserProfile } | null }) =>
  state.session?.user ?? null;
export const selectIsAuthenticated = (state: { session: { accessToken: string } | null }) =>
  Boolean(state.session?.accessToken);
export const selectIsLoading = () => false;

export function useAuth() {
  const session = useAuthSessionStore((state) => state.session);
  const setSession = useAuthSessionStore((state) => state.setSession);
  const clearSession = useAuthSessionStore((state) => state.clearSession);

  return {
    currentUser: session?.user ?? null,
    isAuthenticated: Boolean(session?.accessToken),
    isLoading: false,
    setUser: (user: UserProfile) => {
      if (!session) return;
      setSession({ ...session, user });
    },
    clearUser: () => clearSession(),
    setLoading: () => {},
  } satisfies AuthStore;
}
