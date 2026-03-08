"use client";

import { createContext, useMemo, type ReactNode } from "react";

import { authSessionService } from "@/src/application/services/auth-session.service";
import { useLoginMutation, useLogoutMutation, useAuthSession } from "@/src/presentation/hooks/use-auth-session";

interface User {
  userId: number | string;
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
  const { session, isAuthenticated, user } = useAuthSession();
  const logoutMutation = useLogoutMutation();
  useLoginMutation();

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token: session?.accessToken ?? null,
      login: (token, refreshToken, nextUser) => {
        authSessionService.save({
          accessToken: token,
          refreshToken,
          user: {
            userId: String(nextUser.userId),
            username: nextUser.username,
            email: nextUser.email,
            role: nextUser.role,
          },
        });
      },
      logout: () => {
        void logoutMutation.mutateAsync();
      },
      isAuthenticated,
    }),
    [isAuthenticated, logoutMutation, session?.accessToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
