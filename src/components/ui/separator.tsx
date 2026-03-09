"use client"

/**
 * Thành phần Đường kẻ phân cách (Separator Component)
 * 
 * Được xây dựng trên nền tảng `@radix-ui/react-separator`.
 * Dùng để phân chia các khối nội dung theo chiều ngang hoặc chiều dọc một cách tinh tế.
 */
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import * as React from "react"

import { cn } from "@/utils/cn"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
