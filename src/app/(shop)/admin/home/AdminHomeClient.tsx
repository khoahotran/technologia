"use client";

import { CirclePlus, PencilLine, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
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

type NamedItem = {
    id: string;
    name: string;
};

function normalizeItems<
    T extends { name: string; brandId?: number | string; categoryId?: number | string }
>(items: T[] | undefined, idField: "brandId" | "categoryId") {
    if (!items) return [] as NamedItem[];
    return items.map((item) => ({
        id: String(item[idField]),
        name: item.name,
    }));
}

function ManagementColumn({
    title,
    addLabel,
    items,
    onAdd,
    onEdit,
    onDelete,
    isBusy,
}: {
    title: string;
    addLabel: string;
    items: NamedItem[];
    onAdd: () => void;
    onEdit: (item: NamedItem) => void;
    onDelete: (item: NamedItem) => void;
    isBusy: boolean;
}) {
    return (
        <section className="bg-[#F4F4F4] border border-[#8AB0C3] shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-8 w-full max-w-[460px] h-[980px] overflow-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1E1E1E]">{title}</h2>

            <button
                type="button"
                className="w-full h-28 px-8 my-8 bg-white border border-[#9DA8B3] shadow-[0_4px_8px_rgba(0,0,0,0.15)] rounded-none flex items-center gap-4 text-2xl md:text-4xl font-semibold disabled:opacity-60"
                onClick={onAdd}
                disabled={isBusy}
            >
                <CirclePlus className="h-10 w-10" />
                <span>{addLabel}</span>
            </button>

            <div className="space-y-5">
                {items.map((item) => (
                    <article
                        key={item.id}
                        className="h-28 px-8 bg-white border border-[#AAB3BC] shadow-[0_4px_8px_rgba(0,0,0,0.15)] flex items-center justify-between"
                    >
                        <p className="text-3xl md:text-4xl font-semibold text-[#1E1E1E] truncate pr-6">
                            {item.name}
                        </p>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-[#4B5563]"
                                onClick={() => onEdit(item)}
                                disabled={isBusy}
                            >
                                <PencilLine className="h-6 w-6" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-[#4B5563]"
                                onClick={() => onDelete(item)}
                                disabled={isBusy}
                            >
                                <Trash2 className="h-6 w-6" />
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function renameWithPrompt(itemLabel: string, defaultValue?: string) {
    const nextValue = window.prompt(itemLabel, defaultValue ?? "");
    if (nextValue === null) return null;
    const trimmed = nextValue.trim();
    return trimmed.length > 0 ? trimmed : null;
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
        createBrandMutation.isPending ||
        updateBrandMutation.isPending ||
        deleteBrandMutation.isPending ||
        createCategoryMutation.isPending ||
        updateCategoryMutation.isPending ||
        deleteCategoryMutation.isPending;

    const handleAdd = (type: "brand" | "category") => {
        const nextName = renameWithPrompt(
            type === "brand"
                ? t("admin_enter_new_brand_name", {}, "Enter new brand name")
                : t("admin_enter_new_category_name", {}, "Enter new category name")
        );
        if (!nextName) return;

        if (type === "brand") {
            createBrandMutation.mutate({ name: nextName });
            return;
        }
        createCategoryMutation.mutate({ name: nextName });
    };

    const handleEdit = (type: "brand" | "category", item: NamedItem) => {
        const nextName = renameWithPrompt(
            type === "brand"
                ? t("admin_edit_brand_name", {}, "Edit brand name")
                : t("admin_edit_category_name", {}, "Edit category name"),
            item.name
        );
        if (!nextName) return;

        const numericId = toNumericId(item.id);
        if (numericId === null) return;

        if (type === "brand") {
            updateBrandMutation.mutate({ brandId: numericId, payload: { name: nextName } });
            return;
        }
        updateCategoryMutation.mutate({ categoryId: numericId, payload: { name: nextName } });
    };

    const handleDelete = (type: "brand" | "category", item: NamedItem) => {
        if (!window.confirm(t("admin_confirm_delete_item", { name: item.name }, "Delete {name}?"))) {
            return;
        }

        const numericId = toNumericId(item.id);
        if (numericId === null) return;

        if (type === "brand") {
            deleteBrandMutation.mutate(numericId);
            return;
        }
        deleteCategoryMutation.mutate(numericId);
    };

    if (loadingBrands || loadingCategories) {
        return (
            <div className="py-20 text-center text-xl text-[#556070]">
                {t("admin_loading_management_data", {}, "Loading management data...")}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid xl:grid-cols-2 gap-12 justify-items-center">
                <ManagementColumn
                    title={t("admin_categories", {}, "Categories")}
                    addLabel={t("admin_add_category", {}, "Add category")}
                    items={categories}
                    onAdd={() => handleAdd("category")}
                    onEdit={(item) => handleEdit("category", item)}
                    onDelete={(item) => handleDelete("category", item)}
                    isBusy={isBusy}
                />
                <ManagementColumn
                    title={t("admin_brands", {}, "Brands")}
                    addLabel={t("admin_add_brand", {}, "Add brand")}
                    items={brands}
                    onAdd={() => handleAdd("brand")}
                    onEdit={(item) => handleEdit("brand", item)}
                    onDelete={(item) => handleDelete("brand", item)}
                    isBusy={isBusy}
                />
            </div>
        </div>
    );
}
