"use client"

import { Info } from "lucide-react"

import { PaymentMethodCard } from "./PaymentMethodCard"

import { Button } from "@/components/ui/button"

interface PaymentMethod {
  id: string
  type: "bank" | "wallet"
  name: string
  accountName: string
  accountNumber: string
  isDefault?: boolean
}

interface PaymentMethodListProps {
  type: "bank" | "wallet"
  methods: PaymentMethod[]
  onUse?: (id: string) => void
  onSetDefault?: (id: string) => void
  onAddNew?: () => void
}

export function PaymentMethodList({
  type,
  methods,
  onUse,
  onSetDefault,
  onAddNew,
}: PaymentMethodListProps) {
  const title = type === "bank" ? "Linked bank accounts" : "Linked e-wallet accounts"
  const buttonText = type === "bank" ? "Link new account" : "Link new account"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <Info className="h-5 w-5 text-[#3E93B3]" />
      </div>

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

      <Button
        className="w-full bg-[#C3BFCE] hover:bg-[#B3AFBE] text-white font-medium"
        onClick={onAddNew}
      >
        {buttonText}
      </Button>
    </div>
  )
}
