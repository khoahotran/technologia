"use client";

/**
 * Thành phần Chuyển đổi Giao diện (Theme Toggle Component)
 * 
 * Sử dụng `next-themes` để quản lý trạng thái Light/Dark mode.
 * Sử dụng component `Switch` của UI để tạo hiệu ứng bật/tắt trực quan.
 */
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Đảm bảo component chỉ hiển thị sau khi đã mount trên Client 
  // (Tránh lỗi Hydration Mismatch do theme được đọc từ localStorage)
  useEffect(() => {
    const handle = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(handle);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <Switch
      checked={isDark}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      aria-label="Chuyển đổi giao diện Sáng/Tối"
      className=" cursor-pointer
            data-[state=unchecked]:bg-gray-300
            data-[state=checked]:bg-gray-800
            dark:data-[state=unchecked]:bg-gray-500
            dark:data-[state=checked]:bg-gray-200
        "
    />
  );
}
