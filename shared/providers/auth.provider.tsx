"use client";

import type {
  ReactNode} from "react";
import {
  createContext,
  useState,
  useEffect
} from "react";

interface User {
  id: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const TOKEN_KEY = "auth_token";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser(jwt: string) {
    try {
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    fetch("/api/logout");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}
