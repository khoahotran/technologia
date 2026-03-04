"use client"

/**
 * Các thành phần Ảnh đại diện (Avatar Components)
 * 
 * Được xây dựng trên nền tảng `@radix-ui/react-avatar`.
 * Hỗ trợ hiển thị ảnh người dùng, có cơ chế dự phòng (Fallback) khi ảnh lỗi hoặc chưa tải.
 */
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"

import { cn } from "@/lib/utils"

/** Gốc của Avatar, quản lý vòng đời của ảnh và fallback */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

/** Thành phần hiển thị hình ảnh thực tế */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/** Thành phần hiển thị thay thế (thường là chữ cái đầu tên) khi không có ảnh */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
