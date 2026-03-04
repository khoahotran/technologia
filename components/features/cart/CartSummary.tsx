"use client"

/**
 * Thành phần Tổng kết Giỏ hàng (Cart Summary Component)
 * 
 * Hiển thị bảng tóm tắt tổng số tiền dựa trên các sản phẩm đã được chọn.
 * Bao gồm nút "Thanh toán" để chuyển sang bước nhập thông tin giao hàng.
 */
import Link from "next/link"

import { Button } from "@/components/ui/button"

interface CartSummaryProps {
  /** Tổng số tiền cần thanh toán */
  total: number
  /** Số lượng sản phẩm đã chọn (Tuỳ chọn) */
  itemCount?: number
  /** Đường link chuyển hướng khi nhấn Thanh toán (Mặc định: /shipping) */
  checkoutHref?: string
  /** Trạng thái vô hiệu hóa nút thanh toán (Ví dụ: chưa chọn SP nào) */
  disableCheckout?: boolean
}

export function CartSummary({
  total,
  itemCount = 0,
  checkoutHref = "/shipping",
  disableCheckout = false,
}: CartSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 h-fit sticky top-24">
      <h3 className="font-medium text-gray-900 mb-6">TÓM TẮT ĐƠN HÀNG</h3>

      {/* Khối hiển thị Tổng tiền */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-gray-500">Tổng cộng</span>
        <span className="text-xl font-bold text-[#3E93B3]">
          {new Intl.NumberFormat("vi-VN").format(total)} VND
        </span>
      </div>

      {/* Hiển thị số lượng mục đã chọn */}
      <p className="mb-4 text-sm text-gray-500">Đã chọn {itemCount} sản phẩm</p>

      {/* Nút thanh toán (Disable nếu không có SP nào được chọn) */}
      {disableCheckout ? (
        <Button
          disabled
          className="w-full h-12 text-base font-semibold bg-[#8AB0C3] text-white disabled:opacity-60"
        >
          Thanh toán
        </Button>
      ) : (
        <Button
          asChild
          className="w-full h-12 text-base font-semibold bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white"
        >
          <Link href={checkoutHref}>Thanh toán</Link>
        </Button>
      )}
    </div>
  )
}
