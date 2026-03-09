"use client"

/**
 * Thành phần Biểu mẫu Nhập địa chỉ (Address Form Component)
 * 
 * Hiển thị các trường nhập liệu (Họ tên, SĐT, Tỉnh/Thành phố...) 
 * để người dùng tạo mới hoặc cập nhật địa chỉ giao hàng.
 */
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/providers/language.provider"

export function AddressForm() {
  const { t } = useLanguage()
  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 space-y-6">
      {/* Khối Họ và Tên */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('first_name_label', {}, "First Name *")}</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('last_name_label', {}, "Last Name *")}</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      {/* Khối SĐT và Tỉnh/Thành phố */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('phone_label', {}, "Phone Number *")}</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('city_label', {}, "City/Province *")}</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      {/* Khối Quận/Huyện, Phường/Xã */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('district_label', {}, "District")}</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('ward_label', {}, "Ward/Commune *")}</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      {/* Khối Tên đường và Số nhà */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('street_label', {}, "Street Name *")}</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('house_number_label', {}, "House Number *")}</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      {/* Khối Ghi chú bổ sung */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{t('notes_label', {}, "Note")}</label>
        <Textarea className="bg-[#F9F8FE] border-gray-200 min-h-[100px]" />
      </div>

      {/* Checkbox đặt làm mặc định */}
      <div className="flex items-center space-x-2">
        <Checkbox id="default-address" />
        <label
          htmlFor="default-address"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('set_as_default_label', {}, "Set as default address")}
        </label>
      </div>

      {/* Nút Tạo mới */}
      <div className="flex justify-center pt-4">
        <Button className="w-40 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold">
          {t('create_address_btn', {}, "Create Address")}
        </Button>
      </div>
    </div>
  )
}
