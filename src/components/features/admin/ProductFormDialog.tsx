"use client";

import { Plus, Trash2 } from "lucide-react";
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
import type { Brand, Category, Product, ProductStatus } from "@/features/products/types";
import { useLanguage } from "@/providers/language.provider";

export type ProductFormMode = "create" | "edit" | "add-variant";

export interface ProductVariantEntry {
    variantCode: string;
    price: number;
    stock: number;
    storage: string;
    color: string;
}

export interface ProductFormData {
    name?: string;
    description?: string;
    displayPrice?: number;
    brandId?: number;
    categoryId?: number;
    status?: ProductStatus;
    variantCode?: string;
    price?: number;
    stock?: number;
    storage?: string;
    color?: string;
    variants?: ProductVariantEntry[];
}

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: ProductFormMode;
    product: Product | undefined;
    brands: Brand[];
    categories: Category[];
    onSubmit: (data: ProductFormData) => void;
    isPending: boolean;
}

const emptyVariant = (locale: string): ProductVariantEntry => ({
    variantCode: `VAR-${Date.now()}`,
    price: 0,
    stock: 0,
    storage: "",
    color: locale === "vi" ? "Đen" : "Black",
});

export function ProductFormDialog({
    open,
    onOpenChange,
    mode,
    product,
    brands,
    categories,
    onSubmit,
    isPending,
}: ProductFormDialogProps) {
    const { t, locale } = useLanguage();
    const [form, setForm] = useState({
        name: "",
        description: "",
        displayPrice: 0,
        brandId: undefined as number | undefined,
        categoryId: undefined as number | undefined,
        status: "ACTIVE" as ProductStatus,
        variantCode: "",
        price: 0,
        stock: 0,
        storage: "",
        color: "",
    });
    const [variantRows, setVariantRows] = useState<ProductVariantEntry[]>([emptyVariant(locale)]);

    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && product) {
            setForm({
                name: product.name ?? "",
                description: product.description ?? "",
                displayPrice: product.displayPrice ?? 0,
                brandId: undefined,
                categoryId: undefined,
                status: (product.status as ProductStatus) ?? "ACTIVE",
                variantCode: "",
                price: 0,
                stock: 0,
                storage: "",
                color: "",
            });
        } else if (mode === "create") {
            const initCode = `PROD-${Date.now()}`;
            setForm({
                name: "",
                description: "",
                displayPrice: 0,
                brandId: undefined,
                categoryId: undefined,
                status: "ACTIVE",
                variantCode: "",
                price: 0,
                stock: 0,
                storage: "",
                color: "",
            });
            setVariantRows([{
                variantCode: initCode,
                price: 0,
                stock: 0,
                storage: "",
                color: locale === "vi" ? "Đen" : "Black",
            }]);
        } else if (mode === "add-variant" && product) {
            setForm({
                name: "",
                description: "",
                displayPrice: 0,
                brandId: undefined,
                categoryId: undefined,
                status: "ACTIVE",
                variantCode: `VAR-${Date.now()}`,
                price: product.displayPrice ?? 0,
                stock: 0,
                storage: "",
                color: locale === "vi" ? "Đen" : "Black",
            });
        } else {
            setForm({
                name: "",
                description: "",
                displayPrice: 0,
                brandId: undefined,
                categoryId: undefined,
                status: "ACTIVE",
                variantCode: "",
                price: 0,
                stock: 0,
                storage: "",
                color: "",
            });
        }
    }, [open, mode, product, locale]);

    const update = (field: keyof typeof form, value: string | number | undefined) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateVariantRow = (index: number, field: keyof ProductVariantEntry, value: string | number) => {
        setVariantRows((prev) => {
            const next = prev.map((row, i) =>
                i === index ? { ...row, [field]: value } as ProductVariantEntry : row
            );
            return next;
        });
    };

    const addVariantRow = () => {
        setVariantRows((prev) => [
            ...prev,
            {
                ...emptyVariant(locale),
                variantCode: `VAR-${Date.now()}-${prev.length + 1}`,
            },
        ]);
    };

    const removeVariantRow = (index: number) => {
        setVariantRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (mode === "create") {
            const submitData: ProductFormData = {
                name: form.name,
                description: form.description,
                displayPrice: form.displayPrice,
                status: form.status,
                variants: variantRows,
            };
            if (form.brandId !== undefined) submitData.brandId = form.brandId;
            if (form.categoryId !== undefined) submitData.categoryId = form.categoryId;
            onSubmit(submitData);
        } else if (mode === "edit") {
            const submitData: ProductFormData = {
                name: form.name,
                description: form.description,
                displayPrice: form.displayPrice,
                status: form.status,
            };
            if (form.brandId !== undefined) submitData.brandId = form.brandId;
            if (form.categoryId !== undefined) submitData.categoryId = form.categoryId;
            onSubmit(submitData);
        } else {
            onSubmit({
                variantCode: form.variantCode,
                price: form.price,
                stock: form.stock,
                storage: form.storage,
                color: form.color,
            });
        }
    };

    const titleKey = mode === "create" ? "admin_create_product" : mode === "edit" ? "admin_edit_product" : "admin_add_variant";
    const titleDefault = mode === "create" ? "Create Product" : mode === "edit" ? "Edit Product" : "Add Variant";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t(titleKey, {}, titleDefault)}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                    {(mode === "create" || mode === "edit") && (
                        <>
                            <div className="grid gap-1.5">
                                <Label>{t("admin_product_name", {}, "Product name")}</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    placeholder={t("admin_product_name", {}, "Product name")}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label>{t("description", {}, "Description")}</Label>
                                <Input
                                    value={form.description}
                                    onChange={(e) => update("description", e.target.value)}
                                    placeholder={t("description", {}, "Description")}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label>{t("admin_price", {}, "Price")}</Label>
                                <Input
                                    type="number"
                                    value={form.displayPrice}
                                    onChange={(e) => update("displayPrice", Number(e.target.value))}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label>{t("admin_filter_brand", {}, "Brand")}</Label>
                                    <Select
                                        value={form.brandId !== undefined ? String(form.brandId) : "none"}
                                        onValueChange={(v) => update("brandId", v === "none" ? undefined : Number(v))}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder={t("admin_select", {}, "Select")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map((b) => (
                                                <SelectItem key={String(b.brandId)} value={String(b.brandId)}>
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-1.5">
                                    <Label>{t("admin_filter_category", {}, "Category")}</Label>
                                    <Select
                                        value={form.categoryId !== undefined ? String(form.categoryId) : "none"}
                                        onValueChange={(v) => update("categoryId", v === "none" ? undefined : Number(v))}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder={t("admin_select", {}, "Select")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={String(c.categoryId)} value={String(c.categoryId)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label>{t("status", {}, "Status")}</Label>
                                <Select value={form.status} onValueChange={(v) => update("status", v as ProductStatus)}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">{t("active", {}, "Active")}</SelectItem>
                                        <SelectItem value="INACTIVE">{t("inactive", {}, "Inactive")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {mode === "create" && (
                        <>
                            <div className="border-t border-border pt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                                    {t("admin_variant_details", {}, "Variant Details")}
                                </p>
                            </div>

                            {variantRows.map((vr, idx) => (
                                <div
                                    key={idx}
                                    className="border border-border rounded-xl p-3 space-y-3 relative"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {t("admin_variant_n", { n: idx + 1 }, `Variant #${idx + 1}`)}
                                        </span>
                                        {variantRows.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeVariantRow(idx)}
                                                className="text-destructive hover:text-destructive/80 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label>{t("admin_variant_code", {}, "Variant code")}</Label>
                                        <Input
                                            value={vr.variantCode}
                                            onChange={(e) => updateVariantRow(idx, "variantCode", e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label>{t("admin_price", {}, "Price")}</Label>
                                            <Input
                                                type="number"
                                                value={vr.price}
                                                onChange={(e) => updateVariantRow(idx, "price", Number(e.target.value))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>{t("stock", {}, "Stock")}</Label>
                                            <Input
                                                type="number"
                                                value={vr.stock}
                                                onChange={(e) => updateVariantRow(idx, "stock", Number(e.target.value))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label>{t("storage", {}, "Storage")}</Label>
                                            <Input
                                                value={vr.storage}
                                                onChange={(e) => updateVariantRow(idx, "storage", e.target.value)}
                                                placeholder="128GB"
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>{t("color", {}, "Color")}</Label>
                                            <Input
                                                value={vr.color}
                                                onChange={(e) => updateVariantRow(idx, "color", e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addVariantRow}
                                className="rounded-xl gap-1.5"
                            >
                                <Plus className="h-4 w-4" />
                                {t("admin_add_variant", {}, "Add variant")}
                            </Button>
                        </>
                    )}

                    {mode === "add-variant" && (
                        <>
                            <div className="border-t border-border pt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                                    {t("admin_variant_details", {}, "Variant Details")}
                                </p>
                            </div>

                            <div className="grid gap-1.5">
                                <Label>{t("admin_variant_code", {}, "Variant code")}</Label>
                                <Input
                                    value={form.variantCode}
                                    onChange={(e) => update("variantCode", e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label>{t("admin_price", {}, "Price")}</Label>
                                    <Input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => update("price", Number(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>{t("stock", {}, "Stock")}</Label>
                                    <Input
                                        type="number"
                                        value={form.stock}
                                        onChange={(e) => update("stock", Number(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label>{t("storage", {}, "Storage")}</Label>
                                    <Input
                                        value={form.storage}
                                        onChange={(e) => update("storage", e.target.value)}
                                        placeholder="128GB"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>{t("color", {}, "Color")}</Label>
                                    <Input
                                        value={form.color}
                                        onChange={(e) => update("color", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                        {t("cancel", {}, "Cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || (mode === "create" && (!form.name || !form.brandId || !form.categoryId))}
                        className="rounded-xl"
                    >
                        {mode === "create" ? t("admin_create", {}, "Create") : t("admin_save", {}, "Save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
