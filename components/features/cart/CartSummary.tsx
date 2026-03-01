"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

interface CartSummaryProps {
  total: number
  itemCount?: number
  checkoutHref?: string
  disableCheckout?: boolean
}

export function CartSummary({
  total,
  itemCount = 0,
  checkoutHref = "/shipping",
  disableCheckout = false,
}: CartSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 h-fit sticky top-24">
      <h3 className="font-medium text-gray-900 mb-6">SHOPPING SUMMARY</h3>
      
      <div className="flex items-center justify-between mb-8">
        <span className="text-gray-500">Total</span>
        <span className="text-xl font-bold text-[#3E93B3]">
          {new Intl.NumberFormat("vi-VN").format(total)} VND
        </span>
      </div>

      <p className="mb-4 text-sm text-gray-500">{itemCount} selected item(s)</p>
      {disableCheckout ? (
        <Button
          disabled
          className="w-full h-12 text-base font-semibold bg-[#8AB0C3] text-white disabled:opacity-60"
        >
          Check out
        </Button>
      ) : (
        <Button
          asChild
          className="w-full h-12 text-base font-semibold bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white"
        >
          <Link href={checkoutHref}>Check out</Link>
        </Button>
      )}
    </div>
  )
}
