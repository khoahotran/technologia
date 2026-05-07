"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/providers/language.provider"

interface AddPaymentAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (data: { bankName: string; holderName: string; accountNumber: string; type: "BANK_ACCOUNT" | "E_WALLET"; isDefault: boolean }) => void
    isPending?: boolean
}

export function AddPaymentAccountDialog({ open, onOpenChange, onConfirm, isPending }: AddPaymentAccountDialogProps) {
    const { t } = useLanguage()
    const [bankName, setBankName] = useState("")
    const [holderName, setHolderName] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [type, setType] = useState<"BANK_ACCOUNT" | "E_WALLET">("BANK_ACCOUNT")
    const [isDefault, setIsDefault] = useState(false)

    const handleSubmit = () => {
        if (!bankName.trim() || !holderName.trim() || !accountNumber.trim()) return
        onConfirm({ bankName: bankName.trim(), holderName: holderName.trim(), accountNumber: accountNumber.trim(), type, isDefault })
        setBankName("")
        setHolderName("")
        setAccountNumber("")
        setType("BANK_ACCOUNT")
        setIsDefault(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('add_payment_account_title', {}, "Add Payment Account")}</DialogTitle>
                    <DialogDescription>
                        {t('add_payment_account_description', {}, "Enter your bank account or e-wallet details")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>{t('account_type', {}, "Account type")}</Label>
                        <RadioGroup
                            value={type}
                            onValueChange={(v) => setType(v as "BANK_ACCOUNT" | "E_WALLET")}
                            className="flex gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="BANK_ACCOUNT" id="acc-bank" />
                                <Label htmlFor="acc-bank">{t('bank_account', {}, "Bank Account")}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="E_WALLET" id="acc-wallet" />
                                <Label htmlFor="acc-wallet">{t('e_wallet', {}, "E-wallet")}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bank-name">{type === "BANK_ACCOUNT" ? t('bank_name', {}, "Bank name") : t('wallet_name', {}, "Wallet name")}</Label>
                        <Input
                            id="bank-name"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder={type === "BANK_ACCOUNT" ? "Vietcombank" : "Momo"}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="holder-name">{t('account_holder', {}, "Account holder")}</Label>
                        <Input
                            id="holder-name"
                            value={holderName}
                            onChange={(e) => setHolderName(e.target.value)}
                            placeholder="NGUYEN VAN A"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account-number">{t('account_number', {}, "Account number")}</Label>
                        <Input
                            id="account-number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="1234567890"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is-default"
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is-default">{t('set_as_default_account', {}, "Set as default payment account")}</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel', {}, "Cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!bankName.trim() || !holderName.trim() || !accountNumber.trim() || isPending}
                    >
                        {t('add', {}, "Add")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
