"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <Switch
      checked={isDark}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      aria-label="Toggle dark mode"
      className=" cursor-pointer
            data-[state=unchecked]:bg-gray-300
            data-[state=checked]:bg-gray-800
            dark:data-[state=unchecked]:bg-gray-500
            dark:data-[state=checked]:bg-gray-200
        "
    />
  );
}
