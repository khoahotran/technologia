import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";
import { googleLogin, login, logout } from "./api";
import { useAuthStore } from "./store";
import type { AuthSession } from "./types";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: login,
    onSuccess: (session: AuthSession) => {
      setSession(session);
      toast.success(t('login_success', {}, "Login successful"));
      if (session.user.role === "ADMIN") {
        router.push("/admin/home");
      } else {
        router.push("/");
      }
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error, t('login_failed', {}, "Login failed")));
    },
  });
}

export function useGoogleLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: (session: AuthSession) => {
      setSession(session);
      toast.success(t('google_login_success', {}, "Google login successful"));
      if (session.user.role === "ADMIN") {
        router.push("/admin/home");
      } else {
        router.push("/");
      }
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error, t('google_login_failed', {}, "Google login failed")));
    },
  });
}

export function useLogout() {
  const { session, clearSession } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      if (session?.refreshToken) {
        await logout(session.refreshToken);
      }
    },
    onSettled: () => {
      clearSession();
      router.push("/login");
    },
  });
}

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const logoutMutation = useLogout();

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session?.accessToken,
    token: session?.accessToken ?? null,
    logout: () => logoutMutation.mutate(),
  };
}
