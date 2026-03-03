"use client";

import { createContext, useEffect, useState, ReactNode } from "react";

import { authStorage, storage } from "@/infrastructure/persistence/storage";
import { STORAGE_KEYS } from "@/shared/constants";

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

interface User {
  userId: number | string;
  username: string;
  email: string;
  role: string;
  // Add other user fields as needed
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check storage on mount
    const storedToken = authStorage.getAccessToken();
    const storedUser = storage.get<User>(STORAGE_KEYS.USER_DATA);

    if (storedToken && storedUser) {
      const handle = setTimeout(() => {
        setToken(storedToken);
        setUser(storedUser);
      }, 0);
      return () => clearTimeout(handle);
    }
  }, []);

  const login = (newToken: string, newRefreshToken: string, newUser: User) => {
    authStorage.setTokens(newToken, newRefreshToken);
    storage.set(STORAGE_KEYS.USER_DATA, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    authStorage.clearTokens();
    storage.remove(STORAGE_KEYS.USER_DATA);
    setToken(null);
    setUser(null);
    // router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
