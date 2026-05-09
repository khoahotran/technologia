"use client";

import { CirclePlus, PencilLine, Trash2, Tags, Building2 } from "lucide-react";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useBrands,
    useCategories,
    useCreateBrandAdmin,
    useCreateCategoryAdmin,
    useDeleteBrandAdmin,
    useDeleteCategoryAdmin,
    useUpdateBrandAdmin,
    useUpdateCategoryAdmin,
} from "@/features/products/hooks";
import { useLanguage } from "@/providers/language.provider";

type NamedItem = { id: string; name: string };

function normalizeItems<T extends { name: string; brandId?: number | string; categoryId?: number | string }>(
    items: T[] | undefined, idField: "brandId" | "categoryId"
): NamedItem[] {
    if (!items) return [];
    return items.map((item) => ({ id: String(item[idField]), name: item.name }));
}

function toNumericId(id: string) {
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
}

export default function AdminHomeClient() {
    const { t } = useLanguage();
    const { data: brandData = [], isLoading: loadingBrands } = useBrands();
    const { data: categoryData = [], isLoading: loadingCategories } = useCategories();
    const createBrandMutation = useCreateBrandAdmin();
    const updateBrandMutation = useUpdateBrandAdmin();
    const deleteBrandMutation = useDeleteBrandAdmin();
    const createCategoryMutation = useCreateCategoryAdmin();
    const updateCategoryMutation = useUpdateCategoryAdmin();
    const deleteCategoryMutation = useDeleteCategoryAdmin();

    const brands = useMemo(() => normalizeItems(brandData, "brandId"), [brandData]);
    const categories = useMemo(() => normalizeItems(categoryData, "categoryId"), [categoryData]);

    const isBusy =
        createBrandMutation.isPending || updateBrandMutation.isPending ||
        deleteBrandMutation.isPending || createCategoryMutation.isPending ||
        updateCategoryMutation.isPending || deleteCategoryMutation.isPending;

    const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
    const [dialogType, setDialogType] = useState<"brand" | "category">("category");
    const [dialogItem, setDialogItem] = useState<NamedItem | null>(null);
    const [dialogValue, setDialogValue] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: "brand" | "category"; id: string; name: string } | null>(null);

    const openDialog = (mode: "add" | "edit", type: "brand" | "category", item?: NamedItem) => {
        setDialogMode(mode);
        setDialogType(type);
        setDialogItem(item ?? null);
        setDialogValue(item?.name ?? "");
    };

    const closeDialog = () => {
        setDialogMode(null);
        setDialogValue("");
        setDialogItem(null);
    };

    const handleDialogConfirm = () => {
        const name = dialogValue.trim();
        if (!name) return;

        if (dialogMode === "add") {
            if (dialogType === "brand") {
                createBrandMutation.mutate({ name });
            } else {
                createCategoryMutation.mutate({ name });
            }
        } else if (dialogMode === "edit" && dialogItem) {
            const numericId = toNumericId(dialogItem.id);
            if (numericId === null) return;
            if (dialogType === "brand") {
                updateBrandMutation.mutate({ brandId: numericId, payload: { name } });
            } else {
                updateCategoryMutation.mutate({ categoryId: numericId, payload: { name } });
            }
        }
        closeDialog();
    };

    const handleDelete = (type: "brand" | "category", item: NamedItem) => {
        setDeleteConfirm({ type, id: item.id, name: item.name });
    };

    const confirmDelete = () => {
        if (!deleteConfirm) return;
        const numericId = toNumericId(deleteConfirm.id);
        if (numericId === null) return;
        if (deleteConfirm.type === "brand") {
            deleteBrandMutation.mutate(numericId);
        } else {
            deleteCategoryMutation.mutate(numericId);
        }
        setDeleteConfirm(null);
    };

    if (loadingBrands || loadingCategories) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2].map((col) => (
                        <Card key={col}>
                            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                            <CardContent className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const renderColumn = (title: string, addLabel: string, items: NamedItem[], type: "brand" | "category") => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl border-dashed gap-2 text-sm font-medium"
                    onClick={() => openDialog("add", type)}
                    disabled={isBusy}
                >
                    <CirclePlus className="h-4 w-4" />
                    {addLabel}
                </Button>
                {items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                        {t("admin_no_items", {}, "No items yet")}
                    </p>
                )}
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-accent/30 transition-colors"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {type === "category" ? (
                                <Tags className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                                <Building2 className="h-4 w-4 shrink-0 text-primary" />
                            )}
                            <span className="text-sm font-medium truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openDialog("edit", type, item)}
                                disabled={isBusy}
                            >
                                <PencilLine className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(type, item)}
                                disabled={isBusy}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    const dialogTitle =
        dialogMode === "add"
            ? dialogType === "brand"
                ? t("admin_add_brand", {}, "Add brand")
                : t("admin_add_category", {}, "Add category")
            : dialogType === "brand"
                ? t("admin_edit_brand", {}, "Edit brand")
                : t("admin_edit_category", {}, "Edit category");

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid md:grid-cols-2 gap-6">
                {renderColumn(
                    t("admin_categories", {}, "Categories"),
                    t("admin_add_category", {}, "Add category"),
                    categories,
                    "category"
                )}
                {renderColumn(
                    t("admin_brands", {}, "Brands"),
                    t("admin_add_brand", {}, "Add brand"),
                    brands,
                    "brand"
                )}
            </div>

            <Dialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) closeDialog(); }}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <DialogDescription>
                            {dialogType === "brand"
                                ? t("admin_enter_brand_name_desc", {}, "Enter the name for the brand")
                                : t("admin_enter_category_name_desc", {}, "Enter the name for the category")}
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={dialogValue}
                        onChange={(e) => setDialogValue(e.target.value)}
                        placeholder={dialogType === "brand" ? t("admin_brand_name", {}, "Brand name") : t("admin_category_name", {}, "Category name")}
                        className="rounded-xl"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleDialogConfirm(); }}
                    />
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={closeDialog} className="rounded-xl">
                            {t("cancel", {}, "Cancel")}
                        </Button>
                        <Button onClick={handleDialogConfirm} disabled={!dialogValue.trim() || isBusy} className="rounded-xl">
                            {dialogMode === "add" ? t("add", {}, "Add") : t("save", {}, "Save")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
                onConfirm={confirmDelete}
                title={t("admin_confirm_delete_item", { name: deleteConfirm?.name ?? "" }, "Delete this item?")}
                confirmText={t("confirm", {}, "Confirm")}
                cancelText={t("cancel", {}, "Cancel")}
                variant="destructive"
            />
        </div>
    );
}
