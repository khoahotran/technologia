/**
 * Phục vụ như một hook truy xuất tắt (Shortcut hook) để tương tác dễ dàng với Context của Auth
 */
import { useContext } from "react";

import { AuthContext } from "@/shared/providers/auth.provider";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth bắt buộc phải nằm bên trong phạm vi của AuthProvider");
  return context;
}
