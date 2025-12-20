"use client"

import { Trash2 } from "lucide-react"
import Image from "next/image"

import { QuantitySelector } from "@/components/features/product/QuantitySelector"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"


interface CartItemProps {
  id: string
  title: string
  price: number
  image: string
  productCode?: string
  quantity: number
  isSelected?: boolean
  onQuantityChange: (value: number) => void
  onToggle: (checked: boolean) => void
  onRemove: () => void
}

export function CartItem({
  id: _id,
  title,
  price,
  image,
  productCode = "PRODUCT CODE",
  quantity,
  isSelected,
  onQuantityChange,
  onToggle,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100">
      <div className="pt-8">
        <Checkbox checked={isSelected || false} onCheckedChange={onToggle} />
      </div>

      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 truncate pr-4">{title}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">{productCode}</span>
          </div>
          <p className="text-lg font-medium text-[#3E93B3]">
            {new Intl.NumberFormat("vi-VN").format(price)} VND
          </p>
          <div className="pt-2">
            <Input
              placeholder="+Add note"
              className="h-8 text-xs border-none bg-transparent p-0 placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
        </div>

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
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
