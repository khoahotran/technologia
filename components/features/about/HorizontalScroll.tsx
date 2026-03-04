/**
 * Thành phần Cuộn Ngang (Horizontal Scroll Component)
 * 
 * Vùng chứa giúp hiển thị danh sách các phần tử theo hàng ngang và có thể cuộn được 
 * khi nội dung vượt quá chiều rộng của khung hình. Thanh cuộn mặc định được ẩn đi.
 */
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface HorizontalScrollProps {
  /** Các thành phần con sẽ được hiển thị bên trong vùng cuộn */
  children: ReactNode
  /** Class CSS tùy chỉnh cho thẻ bao bọc ngoài cùng */
  className?: string
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  return (
    <div className={cn("overflow-x-auto scrollbar-hide", className)}>
      <div className="flex gap-6 pb-4">
        {children}
      </div>
    </div>
  )
}
