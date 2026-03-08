"use client";

import { useMutation } from "@tanstack/react-query";

import type { GoogleLoginInput, LoginInput } from "@/src/domain/models/auth.model";
import { googleLoginUseCase } from "@/src/application/use-cases/google-login.use-case";
import { loginUseCase } from "@/src/application/use-cases/login.use-case";
import { logoutUseCase } from "@/src/application/use-cases/logout.use-case";
import { useAuthSessionStore } from "@/src/store/auth-session.store";

export function useAuthSession() {
  const session = useAuthSessionStore((state) => state.session);
  const hydrated = useAuthSessionStore((state) => state.hydrated);

  return {
    session,
    hydrated,
    isAuthenticated: Boolean(session?.accessToken),
    user: session?.user ?? null,
  };
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginInput) => loginUseCase(credentials),
  });
}

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: (payload: GoogleLoginInput) => googleLoginUseCase(payload),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => logoutUseCase(),
  });
}
