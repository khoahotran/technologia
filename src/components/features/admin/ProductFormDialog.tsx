"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

export type ProductFormMode = "create" | "edit";

export interface ProductVariantEntry {
    variantId?: string;
    variantCode: string;
    price: number;
    stock: number;
    storage: string;
    color: string;
    images?: string[];
}

export interface ProductFormData {
    name?: string;
    description?: string;
    displayPrice?: number;
    brandId?: number;
    categoryId?: number;
    status?: ProductStatus;
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
    onVariantImageUpload?: (variantId: string, file: File) => Promise<void>;
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
    onVariantImageUpload,
}: ProductFormDialogProps) {
    const { t, locale } = useLanguage();
    const [form, setForm] = useState({
        name: "",
        description: "",
        displayPrice: 0,
        brandId: undefined as number | undefined,
        categoryId: undefined as number | undefined,
        status: "AVAILABLE" as ProductStatus,
    });
    const [variantRows, setVariantRows] = useState<ProductVariantEntry[]>([emptyVariant(locale)]);
    const [pendingUploads, setPendingUploads] = useState<Record<string, { file: File; previewUrl: string }>>({});
    const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null);
    const [pickTargetVariantId, setPickTargetVariantId] = useState<string | null>(null);
    const imageUploadInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && product) {
            setForm({
                name: product.name ?? "",
                description: product.description ?? "",
                displayPrice: product.displayPrice ?? (product as any).price ?? 0,
                brandId: product.brandId ? Number(product.brandId) : brands.find((b) => String(b.name).trim().toLowerCase() === String(product.brandName ?? product.brand).trim().toLowerCase())?.brandId as number | undefined,
                categoryId: product.categoryId ? Number(product.categoryId) : categories.find((c) => String(c.name).trim().toLowerCase() === String(product.category).trim().toLowerCase())?.categoryId as number | undefined,
                status: (product.status as ProductStatus) ?? "AVAILABLE",
            });
            setVariantRows((product.variants ?? []).map(v => {
                const entry: ProductVariantEntry = {
                    variantCode: (v as any).variantCode ?? `VAR-${Date.now()}`,
                    price: v.price ?? 0,
                    stock: v.stock ?? 0,
                    storage: v.storage ?? "",
                    color: v.color ?? "",
                    images: v.images ?? [],
                };
                if (v.variantId) entry.variantId = v.variantId;
                return entry;
            }));
        } else if (mode === "create") {
            const initCode = `PROD-${Date.now()}`;
            setForm({
                name: "",
                description: "",
                displayPrice: 0,
                brandId: undefined,
                categoryId: undefined,
                status: "DRAFT",
            });
            setVariantRows([{
                variantCode: initCode,
                price: 0,
                stock: 0,
                storage: "",
                color: locale === "vi" ? "Đen" : "Black",
            }]);
        } else {
            setForm({
                name: "",
                description: "",
                displayPrice: 0,
                brandId: undefined,
                categoryId: undefined,
                status: "AVAILABLE",
            });
        }
    }, [open, mode, product, locale]);

    useEffect(() => {
        if (!open) {
            Object.values(pendingUploads).forEach(p => URL.revokeObjectURL(p.previewUrl));
            setPendingUploads({});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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
                variants: variantRows,
            };
            if (form.brandId !== undefined) submitData.brandId = form.brandId;
            if (form.categoryId !== undefined) submitData.categoryId = form.categoryId;
            onSubmit(submitData);
        }
    };

    const titleKey = mode === "create" ? "admin_create_product" : "admin_edit_product";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <input
                    ref={imageUploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file || !pickTargetVariantId) return;
                        const previewUrl = URL.createObjectURL(file);
                        setPendingUploads(prev => ({ ...prev, [pickTargetVariantId]: { file, previewUrl } }));
                        setPickTargetVariantId(null);
                        event.currentTarget.value = "";
                    }}
                />
                <DialogHeader>
                    <DialogTitle>{t(titleKey)}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                    {(mode === "create" || mode === "edit") && (
                        <>
                            <div className="grid gap-1.5">
                                <Label>{t("admin_product_name")}</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    placeholder={t("admin_product_name")}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label>{t("admin_description")}</Label>
                                <Input
                                    value={form.description}
                                    onChange={(e) => update("description", e.target.value)}
                                    placeholder={t("admin_description")}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label>{t("admin_price")}</Label>
                                <Input
                                    type="number"
                                    value={form.displayPrice}
                                    onChange={(e) => update("displayPrice", Number(e.target.value))}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label>{t("admin_filter_brand")}</Label>
                                    <Select
                                        value={form.brandId !== undefined ? String(form.brandId) : "none"}
                                        onValueChange={(v) => update("brandId", v === "none" ? undefined : Number(v))}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder={t("admin_select")} />
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
                                    <Label>{t("admin_filter_category")}</Label>
                                    <Select
                                        value={form.categoryId !== undefined ? String(form.categoryId) : "none"}
                                        onValueChange={(v) => update("categoryId", v === "none" ? undefined : Number(v))}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder={t("admin_select")} />
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
                                <Label>{t("admin_status")}</Label>
                                <Select value={form.status} onValueChange={(v) => update("status", v as ProductStatus)}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">{t("product_status_draft")}</SelectItem>
                                        <SelectItem value="PENDING_REVIEW">{t("product_status_pending_review")}</SelectItem>
                                        <SelectItem value="AVAILABLE">{t("product_status_available")}</SelectItem>
                                        <SelectItem value="OUT_OF_STOCK">{t("product_status_out_of_stock")}</SelectItem>
                                        <SelectItem value="DISCONTINUED">{t("product_status_discontinued")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {(mode === "create" || mode === "edit") && (
                        <>
                            <div className="border-t border-border pt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                                    {t("admin_variant_details")}
                                </p>
                            </div>

                            {variantRows.map((vr, idx) => (
                                <div
                                    key={idx}
                                    className="border border-border rounded-xl p-3 space-y-3 relative"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {t("admin_variant_n", { n: idx + 1 })}
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
                                        <Label>{t("admin_variant_code")}</Label>
                                        <Input
                                            value={vr.variantCode}
                                            onChange={(e) => updateVariantRow(idx, "variantCode", e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label>{t("admin_price")}</Label>
                                            <Input
                                                type="number"
                                                value={vr.price}
                                                onChange={(e) => updateVariantRow(idx, "price", Number(e.target.value))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>{t("stock")}</Label>
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
                                            <Label>{t("storage")}</Label>
                                            <Input
                                                value={vr.storage}
                                                onChange={(e) => updateVariantRow(idx, "storage", e.target.value)}
                                                placeholder={t("admin_placeholder_storage")}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>{t("color")}</Label>
                                            <Input
                                                value={vr.color}
                                                onChange={(e) => updateVariantRow(idx, "color", e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {vr.images && vr.images.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {vr.images.map((img, imgIdx) => (
                                                <img
                                                    key={imgIdx}
                                                    src={img}
                                                    alt=""
                                                    className="w-full h-auto max-h-32 object-contain rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    ) : !pendingUploads[vr.variantId ?? ""] ? (
                                        <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                                            {t("admin_no_image")}
                                        </div>
                                    ) : null}
                                    {vr.variantId && pendingUploads[vr.variantId] && (
                                        <div className="flex flex-wrap gap-2">
                                            <img
                                                src={pendingUploads[vr.variantId]!.previewUrl}
                                                alt="Preview"
                                                className="w-full h-auto max-h-32 object-contain rounded-lg border-2 border-dashed border-primary"
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        {vr.variantId && onVariantImageUpload && !pendingUploads[vr.variantId] && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setPickTargetVariantId(vr.variantId!);
                                                    imageUploadInputRef.current?.click();
                                                }}
                                                className="rounded-xl text-xs"
                                            >
                                                {t("admin_update_image")}
                                            </Button>
                                        )}
                                        {vr.variantId && pendingUploads[vr.variantId] && (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    size="sm"
                                                    disabled={uploadingVariantId === vr.variantId}
                                                    onClick={async () => {
                                                        const pending = pendingUploads[vr.variantId!];
                                                        if (!pending || !onVariantImageUpload) return;
                                                        setUploadingVariantId(vr.variantId!);
                                                        try {
                                                            await onVariantImageUpload(vr.variantId!, pending.file);
                                                            setPendingUploads(prev => {
                                                                 const next = { ...prev };
                                                                 const existed = next[vr.variantId!];
                                                                 if (existed) {
                                                                     URL.revokeObjectURL(existed.previewUrl);
                                                                     delete next[vr.variantId!];
                                                                 }
                                                                 return next;
                                                             });
                                                        } finally {
                                                            setUploadingVariantId(null);
                                                        }
                                                    }}
                                                    className="rounded-xl text-xs"
                                                >
                                                    {uploadingVariantId === vr.variantId ? t("saving") : t("admin_upload")}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setPendingUploads(prev => {
                                                            const next = { ...prev };
                                                            const existed = next[vr.variantId!];
                                                            if (existed) {
                                                                URL.revokeObjectURL(existed.previewUrl);
                                                                delete next[vr.variantId!];
                                                            }
                                                            return next;
                                                        });
                                                    }}
                                                    className="rounded-xl text-xs"
                                                >
                                                    {t("admin_cancel")}
                                                </Button>
                                            </>
                                        )}
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
                                {t("admin_add_variant")}
                            </Button>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                        {t("admin_cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || (mode === "create" && (!form.name || !form.brandId || !form.categoryId))}
                        className="rounded-xl"
                    >
                        {isPending ? t("saving") : (mode === "create" ? t("admin_create") : t("admin_save"))}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
