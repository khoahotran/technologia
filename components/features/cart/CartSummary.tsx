"use client"

import { Button } from "@/components/ui/button"

interface CartSummaryProps {
  total: number
}

export function CartSummary({ total }: CartSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 h-fit sticky top-24">
      <h3 className="font-medium text-gray-900 mb-6">SHOPPING SUMMARY</h3>
      
      <div className="flex items-center justify-between mb-8">
        <span className="text-gray-500">Total</span>
        <span className="text-xl font-bold text-[#3E93B3]">
          {new Intl.NumberFormat("vi-VN").format(total)} VND
        </span>
      </div>

      <Button className="w-full h-12 text-base font-semibold bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white">
        Check out
      </Button>
    </div>
  )
}
