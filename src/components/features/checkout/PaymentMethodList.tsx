"use client"

/**
 * Thành phần Danh sách Phương thức Thanh toán (Payment Method List Component)
 * 
 * Hiển thị một danh sách các phương thức thanh toán cùng loại (Ngân hàng/Ví) 
 * và chứa nút chức năng để liên kết thêm tài khoản mới.
 */
import { Info } from "lucide-react"

import { PaymentMethodCard } from "./PaymentMethodCard"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language.provider"

interface PaymentMethod {
  id: string
  type: "bank" | "wallet"
  name: string
  accountName: string
  accountNumber: string
  isDefault?: boolean
}

interface PaymentMethodListProps {
  /** Loại danh sách (Hiển thị tiêu đề khác nhau tùy loại) */
  type: "bank" | "wallet"
  /** Mảng dữ liệu các phương thức thanh toán */
  methods: PaymentMethod[]
  /** Sự kiện khi nhấn "Sử dụng" trên một thẻ */
  onUse?: (id: string) => void
  /** Sự kiện khi nhấn "Đặt mặc định" trên một thẻ */
  onSetDefault?: (id: string) => void
  /** Sự kiện khi cần nhấn nút "Liên kết mới..." */
  onAddNew?: () => void
}

export function PaymentMethodList({
  type,
  methods,
  onUse,
  onSetDefault,
  onAddNew,
}: PaymentMethodListProps) {
  const { t } = useLanguage()
  // Thay đổi tiêu đề và chữ ở nút bấm dựa trên loại phương thức
  const title = type === "bank" ? t('linked_bank_accounts_title', {}, "Linked bank accounts") : t('linked_wallets_title', {}, "Linked digital wallets")
  const buttonText = type === "bank" ? t('add_bank_btn', {}, "Add bank card/account") : t('link_new_wallet_btn', {}, "Link new wallet")

  return (
    <div className="space-y-6">
      {/* Tiêu đề danh sách */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <Info className="h-5 w-5 text-[#3E93B3]" />
      </div>

      {/* Danh sách các Thẻ */}
      <div className="space-y-4">
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            type={method.type}
            name={method.name}
            accountName={method.accountName}
            accountNumber={method.accountNumber}
            isDefault={method.isDefault || false}
            onUse={() => onUse?.(method.id)}
            onSetDefault={() => onSetDefault?.(method.id)}
          />
        ))}
      </div>

      {/* Nút thêm mới */}
      <Button
        className="w-full bg-[#C3BFCE] hover:bg-[#B3AFBE] text-white font-medium"
        onClick={onAddNew}
      >
        {buttonText}
      </Button>
    </div>
  )
}
