import { useAuthSession } from "@/src/presentation/hooks/use-auth-session";

export function useAuth() {
  const auth = useAuthSession();

  return {
    user: auth.user,
    token: auth.session?.accessToken ?? null,
    login: () => {},
    logout: () => {},
    isAuthenticated: auth.isAuthenticated,
  };
}
