"use client"

import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  const handleDecrement = () => {
    if (value > min) onChange(value - 1)
  }

  return (
    <div className="flex items-center bg-blue-50/50 rounded-lg p-1 w-fit">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-md hover:bg-white hover:shadow-sm text-gray-500"
        onClick={handleDecrement}
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-12 text-center font-semibold text-gray-900">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-md hover:bg-white hover:shadow-sm text-gray-500"
        onClick={handleIncrement}
        disabled={value >= max}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
