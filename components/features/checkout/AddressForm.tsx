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

export function AddressForm() {
  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 space-y-6">
      {/* Khối Họ và Tên */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tên *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Họ *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      {/* Khối SĐT và Tỉnh/Thành phố */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      {/* Khối Quận/Huyện, Phường/Xã */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Quận/Huyện</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Phường/Xã *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      {/* Khối Tên đường và Số nhà */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tên đường *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Số nhà *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      {/* Khối Ghi chú bổ sung */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ghi chú</label>
        <Textarea className="bg-[#F9F8FE] border-gray-200 min-h-[100px]" />
      </div>

      {/* Checkbox đặt làm mặc định */}
      <div className="flex items-center space-x-2">
        <Checkbox id="default-address" />
        <label
          htmlFor="default-address"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Đặt làm địa chỉ mặc định
        </label>
      </div>

      {/* Nút Tạo mới */}
      <div className="flex justify-center pt-4">
        <Button className="w-40 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold">
          Tạo địa chỉ
        </Button>
      </div>
    </div>
  )
}
