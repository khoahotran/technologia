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
        success: <CircleCheckIcon className="size-5 text-success" />,
        info: <InfoIcon className="size-5 text-info" />,
        warning: <TriangleAlertIcon className="size-5 text-warning" />,
        error: <OctagonXIcon className="size-5 text-destructive" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      // Tùy chỉnh CSS Variables để khớp với bảng màu thống nhất (Unified Palette)
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-premium group-[.toaster]:rounded-xl px-4 py-3 min-w-[320px]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-success/30 group-[.toaster]:bg-success/5",
          error: "group-[.toaster]:border-destructive/30 group-[.toaster]:bg-destructive/5",
          warning: "group-[.toaster]:border-warning/30 group-[.toaster]:bg-warning/5",
          info: "group-[.toaster]:border-info/30 group-[.toaster]:bg-info/5",
        }
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "12px",
          "--success-bg": "var(--success)",
          "--success-text": "var(--success-foreground)",
          "--error-bg": "var(--destructive)",
          "--error-text": "var(--primary-foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
