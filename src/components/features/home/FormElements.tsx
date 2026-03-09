"use client"

/**
 * Thành phần Biểu mẫu Tùy chỉnh (Custom Form Elements Component)
 * 
 * Cung cấp các thành phần nhập liệu mở rộng, được thiết kế riêng.
 * Bao gồm:
 * - LabeledInput: Trường nhập liệu (Input) được tự động đính kèm với nhãn (Label) trôi.
 * - SocialButton: Nút bấm đăng nhập qua mạng xã hội (Google, Facebook...).
 */
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Nhãn mô tả trường nhập liệu */
  label: string
  /** Class CSS tùy chỉnh cho thẻ bao bọc ngoài cùng */
  containerClassName?: string
}

/**
 * Thành phần Trường nhập liệu kèm nhãn (LabeledInput)
 * (Sử dụng forwardRef để có thể truy xuất đến thẻ input thực tế từ component cha)
 */
export const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {/* Vùng giới hạn tạo hiệu ứng focus giả lập cho toàn bộ khối */}
        <div className="relative rounded-lg border border-gray-200 bg-white px-3 py-1 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <label className="text-xs font-medium text-gray-500 block mb-0.5">
            {label}
          </label>
          <input
            ref={ref}
            className={cn(
              "block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none",
              className
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)
LabeledInput.displayName = "LabeledInput" // Đặt tên hỗ trợ React DevTools

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Biểu tượng của nhà cung cấp (Google icon, Facebook icon...) */
  icon: React.ReactNode
  /** Tên nhà cung cấp xác thực (Ví dụ: "Google", "Facebook") */
  provider: string
}

/**
 * Thành phần Nút bấm Mạng Xã hội (SocialButton)
 */
export function SocialButton({ icon, provider, className, ...props }: SocialButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "w-full h-12 justify-start gap-3 rounded-lg border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
      {...props}
    >
      {icon}
      <span className="font-medium">Tiếp tục với {provider}</span>
    </Button>
  )
}
