"use client"

/**
 * Thành phần Nhãn văn bản (Label Component)
 * 
 * Được xây dựng trên nền tảng `@radix-ui/react-label`.
 * Thường dùng kết hợp với các Input để tăng tính tiếp cận (Accessibility) cho Form.
 */
import * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"

import { cn } from "@/utils/cn"

/**
 * Thành phần Label
 * @param className Tùy chỉnh class CSS bổ sung
 * @param props Các thuộc tính của Radix Label Root
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
