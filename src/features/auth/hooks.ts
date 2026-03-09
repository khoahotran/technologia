import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { googleLogin, login, logout } from "./api";
import { useAuthStore } from "./store";
import type { AuthSession } from "./types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Request failed";
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (session: AuthSession) => {
      setSession(session);
      toast.success("Login successful");
      router.push("/");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useGoogleLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: (session: AuthSession) => {
      setSession(session);
      toast.success("Google login successful");
      router.push("/");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
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
