"use client";

import { useMutation } from "@tanstack/react-query";

import type { GoogleLoginDto, LoginDto } from "@/domain/user/dto/auth.dto";
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
    mutationFn: (credentials: LoginDto) => loginUseCase(credentials),
  });
}

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: (payload: GoogleLoginDto) => googleLoginUseCase(payload),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => logoutUseCase(),
  });
}
