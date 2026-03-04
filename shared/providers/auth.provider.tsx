"use client";

/**
 * Provider Cung cấp Trạng thái Xác thực (Legacy Auth Provider)
 * 
 * LƯU Ý: Provider này hiện là phiên bản cũ (Legacy), sử dụng React Context state thông thường.
 * Tương lai nên ưu tiên sử dụng `useAuthStore` (từ thư mục infrastructure/state/auth.store.ts)
 * dựa trên Zustand để có hiệu năng tốt hơn và tích hợp sâu hơn với quy trình chuẩn của app.
 */

import { createContext, useEffect, useState, ReactNode } from "react";

import { authStorage, storage } from "@/infrastructure/persistence/storage";
import { STORAGE_KEYS } from "@/shared/constants";

/** Định dạng dữ liệu của Context */
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

/** Base interface cho User (tạm thời) */
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
    // Kiểm tra bộ nhớ cục bộ khi mới mount Hook (chống Hydration mismatch trên Next.js)
    const storedToken = authStorage.getAccessToken();
    const storedUser = storage.get<User>(STORAGE_KEYS.USER_DATA);

    if (storedToken && storedUser) {
      // Dùng setTimeout để đẩy tác vụ setState ra cuối Event Loop
      const handle = setTimeout(() => {
        setToken(storedToken);
        setUser(storedUser);
      }, 0);
      return () => clearTimeout(handle);
    }
  }, []);

  /** Xử lý thông tin khi đăng nhập thành công */
  const login = (newToken: string, newRefreshToken: string, newUser: User) => {
    authStorage.setTokens(newToken, newRefreshToken);
    storage.set(STORAGE_KEYS.USER_DATA, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  /** Tiêu hủy phiên đăng nhập */
  const logout = () => {
    authStorage.clearTokens();
    storage.remove(STORAGE_KEYS.USER_DATA);
    setToken(null);
    setUser(null);
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
