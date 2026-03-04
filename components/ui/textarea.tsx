/**
 * Thành phần Ô nhập liệu văn bản dài (Textarea Component)
 * 
 * Một trình bao bọc cho thẻ <textarea> của HTML. 
 * Được thiết kế để nhập các đoạn văn bản có độ dài lớn (Mô tả, nội dung đánh giá...).
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Thành phần Textarea
 * @param className Tùy chỉnh class CSS bổ sung
 * @param props Các thuộc tính HTML chuẩn của thẻ textarea
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
