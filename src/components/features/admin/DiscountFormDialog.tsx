"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DiscountResponse } from "@/features/discounts/admin-types";
import type { CreateDiscountRequest } from "@/features/discounts/admin-types";
import { useLanguage } from "@/providers/language.provider";

export type DiscountFormMode = "create" | "edit";

interface DiscountFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: DiscountFormMode;
    discount: DiscountResponse | undefined;
    onSubmit: (data: CreateDiscountRequest) => void;
    isPending: boolean;
}

function toLocalDatetimeString(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DiscountFormDialog({
    open,
    onOpenChange,
    mode,
    discount,
    onSubmit,
    isPending,
}: DiscountFormDialogProps) {
    const { t } = useLanguage();

    const [form, setForm] = useState({
        name: "",
        code: "",
        type: "PERCENTAGE" as string,
        scope: "PRODUCT_SPECIFIC" as string,
        discountValue: 0,
        availableAt: "",
        expiredAt: "",
        remainingUsage: 100,
        maxUsagePerUser: 1,
        minOrderValue: 0,
        description: "",
    });

    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && discount) {
            setForm({
                name: discount.name ?? "",
                code: discount.code ?? "",
                type: discount.type ?? "PERCENTAGE",
                scope: discount.scope ?? "PRODUCT_SPECIFIC",
                discountValue: discount.discountValue ?? 0,
                availableAt: toLocalDatetimeString(discount.availableAt),
                expiredAt: toLocalDatetimeString(discount.expireAt),
                remainingUsage: discount.remainingUsage ?? 100,
                maxUsagePerUser: discount.maxUsagePerUser ?? 1,
                minOrderValue: discount.minOrderValue ?? 0,
                description: discount.description ?? "",
            });
        } else {
            setForm({
                name: "",
                code: "",
                type: "PERCENTAGE",
                scope: "PRODUCT_SPECIFIC",
                discountValue: 0,
                availableAt: "",
                expiredAt: "",
                remainingUsage: 100,
                maxUsagePerUser: 1,
                minOrderValue: 0,
                description: "",
            });
        }
    }, [open, mode, discount]);

    const handleSubmit = () => {
        const payload: CreateDiscountRequest = {
            name: form.name.trim(),
            code: form.code.trim(),
            type: form.type as "PERCENTAGE" | "FIXED_AMOUNT",
            scope: form.scope as "PRODUCT_SPECIFIC" | "USER_SPECIFIC",
            discountValue: form.discountValue,
            availableAt: form.availableAt ? new Date(form.availableAt).toISOString() : undefined,
            expiredAt: form.expiredAt ? new Date(form.expiredAt).toISOString() : undefined,
            remainingUsage: form.remainingUsage,
            maxUsagePerUser: form.maxUsagePerUser,
            minOrderValue: form.minOrderValue,
            description: form.description || undefined,
        };
        onSubmit(payload);
    };

    const isValid = form.name.trim() && form.code.trim() && form.discountValue > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create"
                            ? t("admin_add_discount", {}, "Add Discount")
                            : t("admin_edit_discount", {}, "Edit Discount")}
                    </DialogTitle>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto space-y-4 px-0.5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>{t("admin_discount_name", {}, "Name")} *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder={t("admin_discount_name_placeholder", {}, "Summer Sale")}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t("admin_discount_code", {}, "Code")} *</Label>
                            <Input
                                value={form.code}
                                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                                placeholder="SUMMER20"
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>{t("admin_discount_type", {}, "Type")}</Label>
                            <Select
                                value={form.type}
                                onValueChange={(val) => setForm((prev) => ({ ...prev, type: val }))}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">%</SelectItem>
                                    <SelectItem value="FIXED_AMOUNT">{t("currency_vnd", {}, "VND")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t("admin_discount_value", {}, "Discount Value")} *</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.discountValue}
                                onChange={(e) => setForm((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>{t("admin_discount_scope", {}, "Scope")}</Label>
                            <Select
                                value={form.scope}
                                onValueChange={(val) => setForm((prev) => ({ ...prev, scope: val }))}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRODUCT_SPECIFIC">{t("admin_discount_scope_product", {}, "Product Specific")}</SelectItem>
                                    <SelectItem value="USER_SPECIFIC">{t("admin_discount_scope_user", {}, "User Specific")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t("admin_min_order_value", {}, "Min Order Value")}</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.minOrderValue}
                                onChange={(e) => setForm((prev) => ({ ...prev, minOrderValue: Number(e.target.value) }))}
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>{t("admin_available_at", {}, "Available From")}</Label>
                            <Input
                                type="datetime-local"
                                value={form.availableAt}
                                onChange={(e) => setForm((prev) => ({ ...prev, availableAt: e.target.value }))}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t("admin_expire_at", {}, "Expire At")}</Label>
                            <Input
                                type="datetime-local"
                                value={form.expiredAt}
                                onChange={(e) => setForm((prev) => ({ ...prev, expiredAt: e.target.value }))}
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>{t("admin_remaining_usage", {}, "Remaining Usage")}</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.remainingUsage}
                                onChange={(e) => setForm((prev) => ({ ...prev, remainingUsage: Number(e.target.value) }))}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t("admin_max_usage_per_user", {}, "Max Usage/User")}</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.maxUsagePerUser}
                                onChange={(e) => setForm((prev) => ({ ...prev, maxUsagePerUser: Number(e.target.value) }))}
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("admin_discount_description", {}, "Description")}</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder={t("admin_discount_description_placeholder", {}, "Discount description...")}
                            className="rounded-xl min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                        {t("cancel", {}, "Cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid || isPending} className="rounded-xl">
                        {isPending
                            ? t("saving", {}, "Saving...")
                            : mode === "create"
                                ? t("create", {}, "Create")
                                : t("save", {}, "Save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
