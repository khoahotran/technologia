"use client";

import { createContext, useEffect, useMemo, type ReactNode } from "react";

import { initAutoRefresh } from "@/api/client";
import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";

interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, isAuthenticated, logout } = useAuth();
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (hydrated) {
      initAutoRefresh();
    }
  }, [hydrated]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: user ? {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role
      } : null,
      token,
      login: () => {
        // Login is handled by useLogin or useGoogleLogin directly
        console.warn("AuthProvider.login() is deprecated. Use useLogin() hook instead.");
      },
      logout,
      isAuthenticated,
    }),
    [user, token, isAuthenticated, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
