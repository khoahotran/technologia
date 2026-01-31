"use client";

import { createContext, useEffect, useState, ReactNode } from "react";

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

interface User {
  userId: number;
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
    // Check localStorage on mount
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      const handle = setTimeout(() => {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }, 0);
      return () => clearTimeout(handle);
    }
  }, []);

  const login = (newToken: string, newRefreshToken: string, newUser: User) => {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("refresh_token", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
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
