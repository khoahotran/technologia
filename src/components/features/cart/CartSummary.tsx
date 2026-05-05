"use client"

/**
 * Thành phần Tổng kết Giỏ hàng (Cart Summary Component)
 * 
 * Hiển thị bảng tóm tắt tổng số tiền dựa trên các sản phẩm đã được chọn.
 * Bao gồm nút "Thanh toán" để chuyển sang bước nhập thông tin giao hàng.
"use client"

/**
 * Thành phần Tổng kết Giỏ hàng (Cart Summary Component)
 * 
 * Hiển thị bảng tóm tắt tổng số tiền dựa trên các sản phẩm đã được chọn.
 * Bao gồm nút "Thanh toán" để chuyển sang bước nhập thông tin giao hàng.
 */
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language.provider";

interface CartSummaryProps {
  /** Tổng số tiền cần thanh toán */
  total: number
  /** Số tiền được giảm giá */
  discountAmount?: number
  /** Số lượng sản phẩm đã chọn (Tuỳ chọn) */
  itemCount?: number
  /** Đường link chuyển hướng khi nhấn Thanh toán (Mặc định: /shipping) */
  checkoutHref?: string
  /** Trạng thái vô hiệu hóa nút thanh toán (Ví dụ: chưa chọn SP nào) */
  disableCheckout?: boolean
}

export function CartSummary({
  total,
  discountAmount = 0,
  itemCount = 0,
  checkoutHref = "/shipping",
  disableCheckout = false,
}: CartSummaryProps) {
  const { t, locale } = useLanguage();
  const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg border border-border h-fit sticky top-20">
      <h3 className="font-medium text-foreground mb-5 uppercase">{t('order_summary', {}, "ORDER SUMMARY")}</h3>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('subtotal', {}, "Subtotal")}</span>
          <span className="text-foreground font-medium">
            {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(total + discountAmount) }, `${new Intl.NumberFormat(currentLocale).format(total + discountAmount)} ₫`)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">{t('discount', {}, "Discount")}</span>
            <span className="text-green-600 font-medium">
              -{t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(discountAmount) }, `${new Intl.NumberFormat(currentLocale).format(discountAmount)} ₫`)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-base font-semibold">{t('total', {}, "Total")}</span>
          <span className="text-xl font-bold text-primary">
            {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(total) }, `${new Intl.NumberFormat(currentLocale).format(total)} ₫`)}
          </span>
        </div>
      </div>

      {/* Hiển thị số lượng mục đã chọn */}
      <p className="mb-4 text-sm text-muted-foreground">{t('selected_items', { count: itemCount }, `Selected ${itemCount} products`)}</p>

      {/* Nút thanh toán (Disable nếu không có SP nào được chọn) */}
      {disableCheckout ? (
        <Button
          disabled
          className="w-full h-12 text-base font-semibold bg-secondary text-secondary-foreground disabled:opacity-60"
        >
          {t('checkout', {}, "Checkout")}
        </Button>
      ) : (
        <Button
          asChild
          className="w-full h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <Link href={checkoutHref}>{t('checkout', {}, "Checkout")}</Link>
        </Button>
      )}
    </div>
  )
}
