"use client"

/**
 * Thành phần Hiển thị thông báo nhanh (Toast / Sonner Component)
 * 
 * Một trình bao bọc cho thư viện `sonner`, được cấu hình giao diện đồng bộ 
 * với Design System (bao gồm cả Light/Dark Mode) và các icon từ `lucide-react`.
 */
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Thành phần Toaster
 * Cần được đặt ở root của ứng dụng (trong layout.tsx) để có thể hiển thị thông báo toàn cục.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" as 'light' | 'dark' | 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as 'light' | 'dark' | 'system' ?? "light"}
      className="toaster group"
      // Cấu hình các icon tương ứng cho từng loại thông báo
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      // Tùy chỉnh CSS Variables để khớp với bảng màu Tailwind hiện có
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
