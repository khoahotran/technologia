"use client";

import { CirclePlus, Percent, PencilLine, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ApplyProductsDialog } from "@/components/features/admin/ApplyProductsDialog";
import { DiscountFormDialog } from "@/components/features/admin/DiscountFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useCreateDiscountAdmin,
    useDeleteDiscountAdmin,
    useDiscountsPaged,
    useUpdateDiscountAdmin,
    useApplyProductsToDiscountAdmin,
} from "@/features/discounts/admin-hooks";
import type { CreateDiscountRequest, DiscountResponse } from "@/features/discounts/admin-types";
import { useLanguage } from "@/providers/language.provider";

function getPaginationItems(current: number, last: number): (number | "...")[] {
    const items: (number | "...")[] = [];
    if (last <= 7) {
        for (let i = 1; i <= last; i++) items.push(i);
    } else {
        items.push(1);
        if (current > 3) items.push("...");
        const start = Math.max(2, current - 1);
        const end = Math.min(last - 1, current + 1);
        for (let i = start; i <= end; i++) items.push(i);
        if (current < last - 2) items.push("...");
        items.push(last);
    }
    return items;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCurrency(value: number, locale: string, t: (key: string, r?: any, d?: string) => string) {
    const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(value);
    return `${formatted} ${t("currency_vnd", {}, "VND")}`;
}

function formatDate(iso?: string, locale?: string): string {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function DiscountClient() {
    const { t, locale } = useLanguage();
    const [page, setPage] = useState(0);
    const [sortBy, _setSortBy] = useState("createdAt");
    const size = 10;

    const params = { page, size, sortBy, sortDirection: "DESC" as const };
    const discountQuery = useDiscountsPaged(params);
    const createMutation = useCreateDiscountAdmin();
    const updateMutation = useUpdateDiscountAdmin();
    const deleteMutation = useDeleteDiscountAdmin();
    const applyMutation = useApplyProductsToDiscountAdmin();

    const discounts = discountQuery.data?.items ?? [];
    const totalPages = discountQuery.data?.totalPages ?? 1;
    const isBusy =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        applyMutation.isPending;

    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<DiscountResponse | undefined>(undefined);
    const [deleteConfirm, setDeleteConfirm] = useState<DiscountResponse | null>(null);
    const [applyOpen, setApplyOpen] = useState(false);
    const [applyTarget, setApplyTarget] = useState<DiscountResponse | null>(null);

    const paginationItems = useMemo(() => getPaginationItems(page + 1, totalPages), [page, totalPages]);

    const openCreate = () => {
        setDialogMode("create");
        setEditingDiscount(undefined);
        setDialogOpen(true);
    };

    const openEdit = (discount: DiscountResponse) => {
        setDialogMode("edit");
        setEditingDiscount(discount);
        setDialogOpen(true);
    };

    const handleDialogSubmit = (data: CreateDiscountRequest) => {
        if (dialogMode === "create") {
            createMutation.mutate(data);
        } else if (editingDiscount) {
            updateMutation.mutate({ discountId: editingDiscount.discountId, payload: data });
        }
        setDialogOpen(false);
    };

    const handleDelete = () => {
        if (!deleteConfirm) return;
        deleteMutation.mutate(deleteConfirm.discountId);
        setDeleteConfirm(null);
    };

    const handleApply = (payload: { brandIds: number[]; categoryIds: number[] }) => {
        if (!applyTarget) return;
        applyMutation.mutate({
            discountId: applyTarget.discountId,
            payload: {
                brandIds: payload.brandIds,
                categoryIds: payload.categoryIds,
            },
        });
        setApplyOpen(false);
        setApplyTarget(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">
                    {t("admin_discount_management", {}, "Discount Management")}
                </h1>
                <Button
                    onClick={openCreate}
                    disabled={isBusy}
                    className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 shadow-sm"
                >
                    <CirclePlus className="h-4 w-4" />
                    {t("admin_add_discount", {}, "Add Discount")}
                </Button>
            </div>

            {discountQuery.isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                </div>
            ) : discounts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Percent className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{t("admin_no_discounts", {}, "No discounts found")}</p>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        {t("admin_discount_code", {}, "Code")}
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        {t("admin_discount_name", {}, "Name")}
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                                        {t("admin_discount_type", {}, "Type")}
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        {t("admin_discount_value", {}, "Value")}
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                                        {t("admin_available_at", {}, "Available")}
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                                        {t("admin_expire_at", {}, "Expire")}
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                                        {t("admin_status", {}, "Status")}
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        {t("admin_actions", {}, "Actions")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {discounts.map((discount) => (
                                    <tr key={discount.discountId} className="border-b last:border-0 hover:bg-accent/20 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-xs font-medium bg-muted px-2 py-0.5 rounded-md">
                                                {discount.code}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium">{discount.name}</td>
                                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                                            {discount.type === "PERCENTAGE" ? "%" : t("currency_vnd", {}, "VND")}
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold">
                                            {discount.type === "PERCENTAGE"
                                                ? `${discount.discountValue}%`
                                                : formatCurrency(discount.discountValue, locale, t)}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                                            {formatDate(discount.availableAt, locale)}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                                            {formatDate(discount.expireAt, locale)}
                                        </td>
                                        <td className="py-3 px-4 text-center hidden sm:table-cell">
                                            <Badge
                                                variant={discount.isActive ? "default" : "secondary"}
                                                className="rounded-full text-tiny px-2.5"
                                            >
                                                {discount.isActive
                                                    ? t("active", {}, "Active")
                                                    : t("inactive", {}, "Inactive")}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => openEdit(discount)}
                                                    disabled={isBusy}
                                                >
                                                    <PencilLine className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => {
                                                        setApplyTarget(discount);
                                                        setApplyOpen(true);
                                                    }}
                                                    disabled={isBusy}
                                                >
                                                    <Tag className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => setDeleteConfirm(discount)}
                                                    disabled={isBusy}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center pt-2">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
                                    className={page === 0 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            {paginationItems.map((item, index) => (
                                <PaginationItem key={index}>
                                    {item === "..." ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            href="#"
                                            isActive={page === item - 1}
                                            onClick={(e) => { e.preventDefault(); handlePageChange(item - 1); }}
                                        >
                                            {item}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
                                    className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <DiscountFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                discount={editingDiscount}
                onSubmit={handleDialogSubmit}
                isPending={createMutation.isPending || updateMutation.isPending}
            />

            <ApplyProductsDialog
                open={applyOpen}
                onOpenChange={(open) => { if (!open) { setApplyOpen(false); setApplyTarget(null); } }}
                discountName={applyTarget?.name ?? ""}
                onApply={handleApply}
                isPending={applyMutation.isPending}
            />

            <ConfirmDialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
                onConfirm={handleDelete}
                title={t("admin_confirm_delete_item", { name: deleteConfirm?.name ?? "" }, "Delete this discount?")}
                confirmText={t("confirm", {}, "Confirm")}
                cancelText={t("cancel", {}, "Cancel")}
                variant="destructive"
            />
        </div>
    );
}
