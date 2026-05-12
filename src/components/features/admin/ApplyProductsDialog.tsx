"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useBrands, useCategories } from "@/features/products/hooks";
import { useLanguage } from "@/providers/language.provider";

interface ApplyProductsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    discountName: string;
    onApply: (payload: { brandIds: number[]; categoryIds: number[] }) => void;
    isPending: boolean;
}

export function ApplyProductsDialog({
    open,
    onOpenChange,
    discountName,
    onApply,
    isPending,
}: ApplyProductsDialogProps) {
    const { t } = useLanguage();
    const { data: brands = [] } = useBrands();
    const { data: categories = [] } = useCategories();

    const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [mode, setMode] = useState<"brands" | "categories">("brands");

    useEffect(() => {
        if (open) {
            setSelectedBrandIds([]);
            setSelectedCategoryIds([]);
            setMode("brands");
        }
    }, [open]);

    const toggleBrand = (id: number) => {
        setSelectedBrandIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleCategory = (id: number) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleApply = () => {
        onApply({
            brandIds: selectedBrandIds,
            categoryIds: selectedCategoryIds,
        });
    };

    const hasSelection = selectedBrandIds.length > 0 || selectedCategoryIds.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {t("admin_apply_discount_to", { name: discountName }, `Apply "${discountName}" to products`)}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-2">
                    <Button
                        variant={mode === "brands" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("brands")}
                        className="rounded-xl text-xs"
                    >
                        {t("admin_filter_brand", {}, "Brand")}
                    </Button>
                    <Button
                        variant={mode === "categories" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("categories")}
                        className="rounded-xl text-xs"
                    >
                        {t("admin_filter_category", {}, "Category")}
                    </Button>
                </div>

                <div className="max-h-banner-sm overflow-y-auto space-y-2">
                    {mode === "brands" ? (
                        brands.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {t("admin_no_brands", {}, "No brands available")}
                            </p>
                        ) : (
                            brands.map((brand) => {
                                const id = Number(brand.brandId);
                                return (
                                    <label
                                        key={id}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/30 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selectedBrandIds.includes(id)}
                                            onCheckedChange={() => toggleBrand(id)}
                                        />
                                        <span className="text-sm font-medium">{brand.name}</span>
                                    </label>
                                );
                            })
                        )
                    ) : categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {t("admin_no_categories", {}, "No categories available")}
                        </p>
                    ) : (
                        categories.map((cat) => {
                            const id = Number(cat.categoryId);
                            return (
                                <label
                                    key={id}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/30 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={selectedCategoryIds.includes(id)}
                                        onCheckedChange={() => toggleCategory(id)}
                                    />
                                    <span className="text-sm font-medium">{cat.name}</span>
                                </label>
                            );
                        })
                    )}
                </div>

                {hasSelection && (
                    <div className="text-xs text-muted-foreground px-1">
                        {t("admin_selected_count", { count: selectedBrandIds.length + selectedCategoryIds.length }, "{count} selected")}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                        {t("cancel", {}, "Cancel")}
                    </Button>
                    <Button onClick={handleApply} disabled={!hasSelection || isPending} className="rounded-xl">
                        {isPending
                            ? t("applying", {}, "Applying...")
                            : t("admin_apply", {}, "Apply")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
