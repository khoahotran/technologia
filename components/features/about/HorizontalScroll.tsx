import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface HorizontalScrollProps {
  children: ReactNode
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
