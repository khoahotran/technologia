"use client"

/**
 * Thành phần Chọn Số lượng Đặc trưng (Feature Quantity Selector)
 * 
 * Tương tự như QuantitySelector trong UI, nhưng có thể chứa các 
 * tuỳ chỉnh giao diện riêng cho trang Product Detail.
 */
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface QuantitySelectorProps {
  /** Giá trị số lượng hiện tại */
  value: number
  /** Hàm callback gọi khi số lượng thay đổi */
  onChange: (value: number) => void
  /** Giá trị nhỏ nhất (Mặc định: 1) */
  min?: number
  /** Giá trị lớn nhất (Mặc định: 99) */
  max?: number
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  /** Tăng số lượng (nếu chưa đạt max) */
  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  /** Giảm số lượng (nếu lớn hơn min) */
  const handleDecrement = () => {
    if (value > min) onChange(value - 1)
  }

  return (
    <div className="flex items-center bg-blue-50/50 rounded-lg p-1 w-fit">
      {/* Nút Giảm */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-md hover:bg-white hover:shadow-sm text-gray-500"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="Giảm số lượng"
      >
        <Minus className="h-3 w-3" />
      </Button>

      {/* Hiển thị số lượng */}
      <span className="w-12 text-center font-semibold text-gray-900">{value}</span>

      {/* Nút Tăng */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-md hover:bg-white hover:shadow-sm text-gray-500"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Tăng số lượng"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
