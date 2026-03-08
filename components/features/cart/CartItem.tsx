"use client"

/**
 * Thành phần Mục Giỏ hàng (Cart Item Component)
 * 
 * Hiển thị thông tin chi tiết của một sản phẩm trong giỏ hàng, bao gồm:
 * hình ảnh, tên, giá, số lượng, và cho phép chọn/bỏ chọn hoặc xóa khỏi giỏ.
 */
import { Trash2 } from "lucide-react"
import Image from "next/image"

import { QuantitySelector } from "@/components/features/product/QuantitySelector"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/shared/providers/language.provider"

interface CartItemProps {
  /** ID của mục giỏ hàng (Cart item ID hoặc Product ID) */
  id: string
  /** Tên sản phẩm */
  title: string
  /** Giá sản phẩm (dạng số) */
  price: number
  /** Đường dẫn ảnh sản phẩm */
  image: string
  /** Mã sản phẩm (SKU) */
  productCode?: string
  /** Số lượng đang chọn mua */
  quantity: number
  /** Trạng thái mục này có đang được chọn để thanh toán hay không */
  isSelected?: boolean
  /** Sự kiện khi thay đổi số lượng */
  onQuantityChange: (value: number) => void
  /** Sự kiện khi tick/un-tick ô chọn */
  onToggle: (checked: boolean) => void
  /** Sự kiện khi nhấn nút xóa (thùng rác) */
  onRemove: () => void
}

export function CartItem({
  id: _id, // Giữ lại ID nếu cần dùng sau này
  title,
  price,
  image,
  productCode,
  quantity,
  isSelected,
  onQuantityChange,
  onToggle,
  onRemove,
}: CartItemProps) {
  const { t, locale } = useLanguage()
  const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  const displayProductCode = productCode || t('product_code', {}, "PRODUCT CODE")

  return (
    <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100">
      {/* Nút Checkbox chọn thanh toán */}
      <div className="pt-8">
        <Checkbox checked={isSelected || false} onCheckedChange={onToggle} />
      </div>

      {/* Hình ảnh sản phẩm */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 truncate pr-4">{title}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">{displayProductCode}</span>
          </div>
          {/* Giá tiền */}
          <p className="text-lg font-medium text-[#3E93B3]">
            {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(price) }, `${new Intl.NumberFormat(currentLocale).format(price)} ₫`)}
          </p>
          {/* Ô nhập ghi chú (hiện tại tính năng này chưa hoàn thiện hoàn toàn trên Global State) */}
          <div className="pt-2">
            <Input
              placeholder={t('add_note', {}, "+ Add note")}
              className="h-8 text-xs border-none bg-transparent p-0 placeholder:text-gray-400 focus-visible:ring-0 pl-2"
            />
          </div>
        </div>

        {/* Khu vực thao tác (Thay đổi số lượng & Xóa) */}
        <div className="md:col-span-6 flex items-end justify-between md:justify-end gap-4">
          <QuantitySelector
            value={quantity}
            onChange={onQuantityChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
            onClick={onRemove}
            aria-label={t('remove_from_cart', {}, "Remove from cart")}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
