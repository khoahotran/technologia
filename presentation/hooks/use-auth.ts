/**
 * Phục vụ như một hook truy xuất tắt (Shortcut hook) để tương tác dễ dàng với Context của Auth
 */
import { useContext } from "react";

import { AuthContext } from "@/shared/providers/auth.provider";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      login: () => {},
      logout: () => {},
      isAuthenticated: false,
    };
  }
  return context;
}
