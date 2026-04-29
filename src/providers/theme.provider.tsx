"use client";

/**
 * Provider Cung cấp Giao diện (Theme Provider)
 *
 * Tích hợp thư viện `next-themes` để hỗ trợ chế độ Light / Dark mode 
 * hoặc các tùy chọn màu sắc cá nhân hóa cho toàn trang.
 */

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Gói gọn Component của NextThemes để quản lý trạng thái giao diện UI
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
