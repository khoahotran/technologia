"use client"

/**
 * Thành phần Thẻ Địa chỉ (Address Card Component)
 * 
 * Hiển thị thông tin liên hệ và địa chỉ giao hàng của người dùng.
 * Cho phép người dùng chọn sử dụng địa chỉ này hoặc đặt làm thẻ mặc định.
*/
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/shared/providers/language.provider"

interface AddressCardProps {
  /** Tên người nhận */
  name: string
  /** Số điện thoại người nhận */
  phone: string
  /** Địa chỉ chi tiết */
  address: string
  /** Cờ đánh dấu đây có phải là địa chỉ mặc định hay không */
  isDefault?: boolean
  /** Sự kiện khi nhấn "Sử dụng địa chỉ này" */
  onUse?: () => void
  /** Sự kiện khi nhấn "Đặt làm mặc định" */
  onSetDefault?: () => void
}

export function AddressCard({
  name,
  phone,
  address,
  isDefault,
  onUse,
  onSetDefault,
}: AddressCardProps) {
  const { t } = useLanguage()
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
      {/* Khối Tên người nhận */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{t('receiver_name', {}, "Receiver Title")}</p>
          <p className="font-medium text-gray-900">{name}</p>
        </div>
        {/* Nhãn Mặc định */}
        {isDefault && (
          <span className="text-sm font-medium text-[#3E93B3]">{t('default', {}, "Default")}</span>
        )}
      </div>

      {/* Khối Số điện thoại */}
      <div className="space-y-1">
        <p className="text-sm text-gray-500">{t('customer_phone', {}, "Customer phone number")}</p>
        <p className="font-medium text-gray-900">{phone}</p>
      </div>

      {/* Khối Địa chỉ chi tiết */}
      <div className="space-y-1">
        <p className="text-sm text-gray-500">{t('detailed_address', {}, "Detailed address (Note, House number, Street, Ward, District, City)")}</p>
        <p className="font-medium text-gray-900">{address}</p>
      </div>

      {/* Khối Các nút thao tác */}
      <div className="flex gap-4 pt-2">
        <Button
          variant="secondary"
          className="flex-1 bg-[#D3E4F4] hover:bg-[#C1D8EB] text-gray-700 font-medium"
          onClick={onUse}
        >
          {t('use_address', {}, "Use address")}
        </Button>
        <Button
          variant="secondary"
          className="flex-1 bg-[#D3E4F4] hover:bg-[#C1D8EB] text-gray-700 font-medium"
          onClick={onSetDefault}
        >
          {t('set_as_default', {}, "Set as default")}
        </Button>
      </div>
    </div>
  )
}
