"use client"

/**
 * Thành phần Thẻ Phương thức Thanh toán (Payment Method Card Component)
 * 
 * Hiển thị thông tin tóm tắt của một phương thức thanh toán đã liên kết
 * (Ví dụ: Thẻ ngân hàng, Ví điện tử), kèm theo thao tác sử dụng hoặc đặt mặc định.
 */
import { Landmark, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/shared/providers/language.provider"

interface PaymentMethodCardProps {
  /** Loại phương thức: Thẻ ngân hàng (bank) hoặc Ví điện tử (wallet) */
  type: "bank" | "wallet"
  /** Tên phương thức (Ví dụ: "Vietcombank", "Momo") */
  name: string
  /** Tên chủ tài khoản */
  accountName: string
  /** Số tài khoản (hoặc một phần đã bị ẩn) */
  accountNumber: string
  /** Đánh dấu xem đây có phải phương thức lấy làm mặc định hay không */
  isDefault?: boolean
  /** Sự kiện khi nhấn "Sử dụng tài khoản này" */
  onUse?: () => void
  /** Sự kiện khi nhấn "Đặt làm mặc định" */
  onSetDefault?: () => void
}

export function PaymentMethodCard({
  type,
  name,
  accountName,
  accountNumber,
  isDefault,
  onUse,
  onSetDefault,
}: PaymentMethodCardProps) {
  const { t } = useLanguage()
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
      {/* Tên Phương thức và Biểu tượng */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {type === "bank" ? (
            <Landmark className="h-5 w-5 text-gray-700" />
          ) : (
            <Wallet className="h-5 w-5 text-gray-700" />
          )}
          <span className="font-bold text-gray-900">{name}</span>
        </div>
        {/* Nhãn Mặc định */}
        {isDefault && (
          <span className="text-sm font-medium text-gray-500">{t('default', {}, "Default")}</span>
        )}
      </div>

      {/* Thông tin tài khoản */}
      <div className="space-y-1 pl-7">
        <p className="text-sm text-gray-500 uppercase">{accountName}</p>
        <p className="text-sm text-gray-500">
          {type === "bank" ? t('bank_account_label', {}, "Bank account") : t('wallet_number_label', {}, "Digital wallet number")}
        </p>
        <p className="font-medium text-gray-900">{accountNumber}</p>
      </div>

      {/* Các nút thao tác */}
      <div className="flex gap-4 pt-2 pl-7">
        <Button
          variant="secondary"
          className="flex-1 bg-[#D3E4F4] hover:bg-[#C1D8EB] text-gray-700 font-medium text-xs"
          onClick={onUse}
        >
          {type === "bank" ? t('use_account_btn', {}, "Use account") : t('use_wallet_btn', {}, "Use this wallet")}
        </Button>
        <Button
          variant="secondary"
          className="flex-1 bg-[#D3E4F4] hover:bg-[#C1D8EB] text-gray-700 font-medium text-xs"
          onClick={onSetDefault}
        >
          {t('set_as_default', {}, "Set as default")}
        </Button>
      </div>
    </div>
  )
}
