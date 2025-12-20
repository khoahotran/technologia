"use client"

import { Landmark, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"

interface PaymentMethodCardProps {
  type: "bank" | "wallet"
  name: string
  accountName: string
  accountNumber: string
  isDefault?: boolean
  onUse?: () => void
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
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {type === "bank" ? (
            <Landmark className="h-5 w-5 text-gray-700" />
          ) : (
            <Wallet className="h-5 w-5 text-gray-700" />
          )}
          <span className="font-bold text-gray-900">{name}</span>
        </div>
        {isDefault && (
          <span className="text-sm font-medium text-gray-500">Default</span>
        )}
      </div>

      <div className="space-y-1 pl-7">
        <p className="text-sm text-gray-500 uppercase">{accountName}</p>
        <p className="text-sm text-gray-500">
          {type === "bank" ? "bank account number" : "e-wallet number"}
        </p>
        <p className="font-medium text-gray-900">{accountNumber}</p>
      </div>

      <div className="flex gap-4 pt-2 pl-7">
        <Button
          variant="secondary"
          className="flex-1 bg-[#D3E4F4] hover:bg-[#C1D8EB] text-gray-700 font-medium text-xs"
          onClick={onUse}
        >
          {type === "bank" ? "use account" : "use account"}
        </Button>
        <Button
          variant="secondary"
          className="flex-1 bg-[#D3E4F4] hover:bg-[#C1D8EB] text-gray-700 font-medium text-xs"
          onClick={onSetDefault}
        >
          set as default
        </Button>
      </div>
    </div>
  )
}
