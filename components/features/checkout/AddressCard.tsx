"use client"

import { Button } from "@/components/ui/button"

interface AddressCardProps {
  name: string
  phone: string
  address: string
  isDefault?: boolean
  onUse?: () => void
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
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Customer name</p>
          <p className="font-medium text-gray-900">{name}</p>
        </div>
        {isDefault && (
          <span className="text-sm font-medium text-[#3E93B3]">Default</span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-500">Customer phone number</p>
        <p className="font-medium text-gray-900">{phone}</p>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-500">Customer address (note, no, street, ward, city, province)</p>
        <p className="font-medium text-gray-900">{address}</p>
      </div>

      <div className="flex gap-4 pt-2">
        <Button
          variant="secondary"
          className="flex-1 bg-[#D3E4F4] hover:bg-[#C1D8EB] text-gray-700 font-medium"
          onClick={onUse}
        >
          use address
        </Button>
        <Button
          variant="secondary"
          className="flex-1 bg-[#D3E4F4] hover:bg-[#C1D8EB] text-gray-700 font-medium"
          onClick={onSetDefault}
        >
          set as default
        </Button>
      </div>
    </div>
  )
}
