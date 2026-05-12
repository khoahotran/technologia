"use client";

import { Bell, CirclePlus, Search, SlidersHorizontal, Smartphone, Star, Tag, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { ProductFormData, ProductFormMode } from "@/components/features/admin/ProductFormDialog";
import { ProductFormDialog } from "@/components/features/admin/ProductFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useAddVariantImageAdmin,
    useApplyProductsToDiscountAdmin,
    useBrands,
    useCategories,
    useCreateProductAdmin,
    useDeleteProductAdmin,
    useDeleteProductVariantAdmin,
    useProducts,
    useUpdateProductAdmin,
    useUpdateProductVariantAdmin,
} from "@/features/products/hooks";
import type { Brand, Category, Product } from "@/features/products/types";
import { useLanguage } from "@/providers/language.provider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function currencyVnd(value: number, locale: string, t?: (key: string, r?: any, d?: string) => string) {
    const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(value);
    const unit = t ? t("currency_vnd") : "VND";
    return `${formatted} ${unit}`;
}

function toIdFromFilter(value: string) {
    if (value === "all") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

function getBrandId(product: Product, brands: Brand[], selectedBrandId: string) {
    const directSelected = toIdFromFilter(selectedBrandId);
    if (directSelected !== null) return directSelected;
    const byName = brands.find((entry) => entry.name === (product.brandName ?? product.brand));
    if (byName) return Number(byName.brandId);
    return null;
}

function getCategoryId(product: Product, categories: Category[], selectedCategoryId: string) {
    const directSelected = toIdFromFilter(selectedCategoryId);
    if (directSelected !== null) return directSelected;
    const byName = categories.find((entry) => entry.name === product.category);
    if (byName) return Number(byName.categoryId);
    return null;
}

function ProductTile({
    name,
    price,
    rating,
    description,
    image,
    status,
    selected,
    menuOpen,
    onToggle,
    onToggleMenu,
    onAction,
}: {
    name: string;
    price: number;
    rating: number;
    description: string | undefined;
    image: string | undefined;
    status: string | undefined;
    selected: boolean;
    menuOpen: boolean;
    onToggle: () => void;
    onToggleMenu: () => void;
    onAction: (action: "view" | "edit" | "remove" | "apply" | "upload") => void;
}) {
    const { t, locale } = useLanguage();
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className={`relative bg-card rounded-2xl border ${menuOpen ? "" : "overflow-hidden"} transition-all duration-300 hover:shadow-lg hover:border-primary/20 flex flex-col ${selected ? "ring-2 ring-primary border-primary" : "border-border"
                }`}
        >
            <div className="absolute top-3 left-3 z-10">
                <Checkbox checked={selected} onCheckedChange={onToggle} />
            </div>

            {status === "AVAILABLE" && (
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant="secondary" className="rounded-full px-2.5 text-tiny font-semibold">
                        {t("product_status_available")}
                    </Badge>
                </div>
            )}

            {(status === "OUT_OF_STOCK" || status === "DISCONTINUED") && (
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant="destructive" className="rounded-full px-2.5 text-tiny">
                        {t(`product_status_${status.toLowerCase()}`)}
                    </Badge>
                </div>
            )}

            {(status === "DRAFT" || status === "PENDING_REVIEW") && (
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant="outline" className="rounded-full px-2.5 text-tiny">
                        {t(`product_status_${status.toLowerCase()}`)}
                    </Badge>
                </div>
            )}

            <div className="aspect-square w-full bg-muted/30 flex items-center justify-center relative p-6">
                {image && !imgError ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <div className="w-12 h-12 rounded-full bg-muted/30" />
                    </div>
                )}
            </div>

            <div className="p-3 flex flex-col flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.2em]">{name}</h3>
                {description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
                )}

                <div className="mt-auto pt-2">
                    <div className="flex items-center gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-3 w-3 ${star <= rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{currencyVnd(price, locale, t)}</span>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
                                className="h-7 w-7 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-primary inline-flex items-center justify-center transition-colors"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                            </button>
                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={onToggleMenu} />
                                    <div className="absolute bottom-full right-0 mb-1 bg-popover border rounded-xl shadow-md z-30 min-w-32 py-1 overflow-hidden">
                                        {/* {(["view", "edit", "remove", "apply", "upload"] as const).map((action) => ( */}
                                        {(["view", "edit", "remove"] as const).map((action) => (
                                            <button
                                                key={action}
                                                type="button"
                                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                                                onClick={() => onAction(action)}
                                            >
                                                {t(`admin_action_${action}`)}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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

export default function AdminProductsClient() {
    const { t } = useLanguage();
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState<string>("all");
    const [brandId, setBrandId] = useState<string>("all");
    const [minPrice, setMinPrice] = useState<string>("0");
    const [maxPrice, setMaxPrice] = useState<string>("100000000");
    const [sortBy, setSortBy] = useState<string>("displayPrice");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
    const [uploadTarget, setUploadTarget] = useState<{ productId: string; variantId: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<ProductFormMode>("create");
    const [dialogProduct, setDialogProduct] = useState<Product | undefined>(undefined);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [discountIdInput, setDiscountIdInput] = useState("");
    const [discountProductId, setDiscountProductId] = useState<string | null>(null);
    const uploadInputRef = useRef<HTMLInputElement | null>(null);

    const createProductMutation = useCreateProductAdmin();
    const updateProductMutation = useUpdateProductAdmin();
    const deleteProductMutation = useDeleteProductAdmin();
    const updateProductVariantMutation = useUpdateProductVariantAdmin();
    const deleteProductVariantMutation = useDeleteProductVariantAdmin();
    const addVariantImageMutation = useAddVariantImageAdmin();
    const applyDiscountMutation = useApplyProductsToDiscountAdmin();

    const { data: categories = [] } = useCategories();
    const { data: brands = [] } = useBrands();
    const params = {
        page,
        size: 12,
        keyword: search.trim() || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
        brandId: brandId === "all" ? undefined : brandId,
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
        sortBy,
        sortDirection: "DESC" as const,
    };

    const definedParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined)
    );

    const productQuery = useProducts(definedParams);

    const products = productQuery.data?.items ?? [];
    const totalPages = productQuery.data?.totalPages ?? 1;
    const selectedCount = selectedIds.length;
    const allOnPageSelected =
        products.length > 0 && products.every((product) => selectedIds.includes(String(product.productId)));

    const priceRanges = useMemo(
        () => [
            { label: `0 ${t("currency_vnd")}`, value: "0" },
            { label: `100.000 ${t("currency_vnd")}`, value: "100000" },
            { label: `500.000 ${t("currency_vnd")}`, value: "500000" },
            { label: `1.000.000 ${t("currency_vnd")}`, value: "1000000" },
            { label: `3.000.000 ${t("currency_vnd")}`, value: "3000000" },
            { label: `5.000.000 ${t("currency_vnd")}`, value: "5000000" },
            { label: `10.000.000 ${t("currency_vnd")}`, value: "10000000" },
            { label: `20.000.000 ${t("currency_vnd")}`, value: "20000000" },
            { label: `50.000.000 ${t("currency_vnd")}`, value: "50000000" },
            { label: `100.000.000 ${t("currency_vnd")}`, value: "100000000" },
        ],
        [t]
    );

    const isBusy =
        createProductMutation.isPending ||
        updateProductMutation.isPending ||
        deleteProductMutation.isPending ||
        updateProductVariantMutation.isPending ||
        deleteProductVariantMutation.isPending ||
        addVariantImageMutation.isPending ||
        applyDiscountMutation.isPending;

    const toggleProduct = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleSelectAllCurrentPage = (checked: boolean) => {
        if (!checked) {
            setSelectedIds((prev) =>
                prev.filter((id) => !products.some((product) => String(product.productId) === id))
            );
            return;
        }
        setSelectedIds((prev) =>
            Array.from(new Set([...prev, ...products.map((product) => String(product.productId))]))
        );
    };

    const handleCreateProduct = () => {
        if (!brands.length || !categories.length) {
            toast.error(t("admin_create_product_requires_brand_category"));
            return;
        }
        setDialogMode("create");
        setDialogProduct(undefined);
        setDialogOpen(true);
    };

    const handleAction = (action: "view" | "edit" | "remove" | "apply" | "upload", productId: string) => {
        setMenuOpenFor(null);
        const selectedProduct = products.find((item) => String(item.productId) === productId);

        if (!selectedProduct) {
            toast.error(t("admin_product_not_found"));
            return;
        }

        if (action === "view") {
            window.open(`/products/${productId}`, "_blank", "noopener,noreferrer");
            return;
        }

        if (action === "remove") {
            setDeleteConfirm(productId);
            return;
        }

        if (action === "apply") {
            setDiscountProductId(productId);
            setDiscountIdInput("");
            setDiscountDialogOpen(true);
            return;
        }

        if (action === "upload") {
            const firstVariant = selectedProduct.variants?.find((variant) => Boolean(variant.variantId));
            if (!firstVariant?.variantId) {
                toast.error(t("admin_variant_missing_for_upload"));
                return;
            }
            setUploadTarget({ productId, variantId: firstVariant.variantId });
            uploadInputRef.current?.click();
            return;
        }

        setDialogMode("edit");
        setDialogProduct(selectedProduct);
        setDialogOpen(true);
    };

    const handleDialogSubmit = async (data: ProductFormData) => {
        if (dialogMode === "create") {
            const selectedBrandId = data.brandId ?? (brands[0] ? Number(brands[0].brandId) : null);
            const selectedCategoryId = data.categoryId ?? (categories[0] ? Number(categories[0].categoryId) : null);
            if (selectedBrandId === null || selectedCategoryId === null) {
                toast.error(t("admin_create_product_requires_brand_category"));
                return;
            }
            const variants = (data.variants ?? []).map((v) => ({
                variantCode: v.variantCode,
                price: v.price,
                stock: v.stock,
                storage: v.storage,
                color: v.color,
                images: [],
            }));
            createProductMutation.mutate({
                name: data.name!,
                description: data.description!,
                displayPrice: data.displayPrice!,
                brandId: selectedBrandId!,
                categoryId: selectedCategoryId!,
                status: data.status ?? "DRAFT",
                variants,
            });
            setDialogOpen(false);
        } else if (dialogMode === "edit" && dialogProduct) {
            const resolvedBrandId = data.brandId ?? getBrandId(dialogProduct, brands, brandId);
            const resolvedCategoryId = data.categoryId ?? getCategoryId(dialogProduct, categories, categoryId);
            if (resolvedBrandId === null || resolvedCategoryId === null) {
                toast.error(t("admin_create_product_requires_brand_category"));
                return;
            }
            const productId = String(dialogProduct.productId);
            setDialogOpen(false);
            try {
                await updateProductMutation.mutateAsync({
                    productId,
                    payload: {
                        name: data.name!,
                        description: data.description!,
                        displayPrice: data.displayPrice!,
                        brandId: resolvedBrandId,
                        categoryId: resolvedCategoryId,
                        status: data.status ?? "DRAFT",
                    },
                });
                for (const variant of (data.variants ?? [])) {
                    if (variant.variantId) {
                        await updateProductVariantMutation.mutateAsync({
                            productId,
                            variantId: variant.variantId,
                            payload: {
                                price: variant.price,
                                stock: variant.stock,
                                storage: variant.storage,
                                color: variant.color,
                                images: variant.images ?? [],
                            },
                        });
                    }
                }
            } catch {
                // Errors handled by mutation toasts
            }
        }
    };

    const handleApplyDiscount = () => {
        if (!discountIdInput.trim()) return;
        const ids = discountProductId ? [discountProductId] : selectedIds;
        applyDiscountMutation.mutate({
            discountId: discountIdInput.trim(),
            productVariantIds: ids.map((id) => ({ productId: id, variantId: "" })),
        });
        setDiscountDialogOpen(false);
        setDiscountIdInput("");
        setDiscountProductId(null);
    };
    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const paginationItems = useMemo(() => getPaginationItems(page + 1, totalPages), [page, totalPages]);

    return (
        <div className="container mx-auto px-4 py-6 space-y-4">
            <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file || !uploadTarget) return;
                    addVariantImageMutation.mutate({
                        productId: uploadTarget.productId,
                        variantId: uploadTarget.variantId,
                        image: file,
                    });
                    event.currentTarget.value = "";
                }}
            />

            <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("admin_search_here")}
                    className="h-10 pl-9 rounded-xl text-sm bg-card"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div>
                    <p className="text-tiny font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                        {t("admin_filter_category")}
                    </p>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="h-9 text-xs gap-1 px-2.5">
                            <Smartphone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("admin_all")}</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={String(category.categoryId)} value={String(category.categoryId)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className="text-tiny font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                        {t("admin_filter_brand")}
                    </p>
                    <Select value={brandId} onValueChange={setBrandId}>
                        <SelectTrigger className="h-9 text-xs gap-1 px-2.5">
                            <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("admin_all")}</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={String(brand.brandId)} value={String(brand.brandId)}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className="text-tiny font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                        {t("admin_filter_min_price")}
                    </p>
                    <Select value={minPrice} onValueChange={setMinPrice}>
                        <SelectTrigger className="h-9 text-xs gap-1 px-2.5">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {priceRanges.map((range) => (
                                <SelectItem key={`min-${range.value}`} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className="text-tiny font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                        {t("admin_filter_max_price")}
                    </p>
                    <Select value={maxPrice} onValueChange={setMaxPrice}>
                        <SelectTrigger className="h-9 text-xs gap-1 px-2.5">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {priceRanges.map((range) => (
                                <SelectItem key={`max-${range.value}`} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className="text-tiny font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                        {t("admin_filter_order")}
                    </p>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-9 text-xs gap-1 px-2.5">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="displayPrice">{t("admin_price")}</SelectItem>
                            <SelectItem value="createdAt">{t("admin_order_created_date")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleCreateProduct}
                    disabled={isBusy}
                    className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60 shadow-sm"
                >
                    <CirclePlus className="h-4 w-4" />
                    <span>{t("admin_add_product")}</span>
                </button>

                <div className="flex-1 min-w-0 h-10 px-4 rounded-xl border bg-card flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm">
                        <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground whitespace-nowrap">
                            {t("admin_products_chose", { count: selectedCount })}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Checkbox
                                checked={allOnPageSelected}
                                onCheckedChange={(value) => toggleSelectAllCurrentPage(Boolean(value))}
                                className="h-4 w-4"
                            />
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                {t("admin_select_all_page")}
                            </span>
                        </div>
                        {selectedCount > 0 && (
                            <button
                                type="button"
                                onClick={() => { setDiscountIdInput(""); setDiscountDialogOpen(true); }}
                                disabled={isBusy}
                                className="h-7 px-3 rounded-full bg-primary text-primary-foreground inline-flex items-center gap-1 text-xs font-medium disabled:opacity-60"
                            >
                                {t("admin_apply_discount")}
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {productQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl border overflow-hidden">
                            <Skeleton className="aspect-square w-full rounded-none" />
                            <div className="p-3 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-sm">{t("admin_no_products_found")}</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => {
                        const id = String(product.productId);
                        const firstImage = product.variants?.[0]?.images?.[0];
                        return (
                            <ProductTile
                                key={id}
                                name={product.name}
                                price={product.displayPrice ?? 0}
                                rating={Math.max(1, Math.round(product.averageRating ?? 4))}
                                description={product.description}
                                image={firstImage}
                                status={product.status}
                                selected={selectedIds.includes(id)}
                                menuOpen={menuOpenFor === id}
                                onToggle={() => toggleProduct(id)}
                                onToggleMenu={() => setMenuOpenFor((prev) => (prev === id ? null : id))}
                                onAction={(action) => handleAction(action, id)}
                            />
                        );
                    })}
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

            <Dialog open={discountDialogOpen} onOpenChange={(open) => { if (!open) setDiscountProductId(null); setDiscountDialogOpen(open); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("admin_discount_id_prompt")}</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={discountIdInput}
                        onChange={(e) => setDiscountIdInput(e.target.value)}
                        placeholder={t("admin_discount_id_prompt")}
                        className="rounded-xl"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleApplyDiscount();
                        }}
                    />
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDiscountDialogOpen(false)} className="rounded-xl">
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleApplyDiscount}
                            disabled={!discountIdInput.trim() || isBusy}
                            className="rounded-xl"
                        >
                            {t("confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ProductFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                product={dialogProduct}
                brands={brands}
                categories={categories}
                onSubmit={handleDialogSubmit}
                isPending={
                    createProductMutation.isPending ||
                    updateProductMutation.isPending ||
                    updateProductVariantMutation.isPending
                }
                onVariantImageUpload={async (variantId, file) => {
                    if (!dialogProduct) return;
                    await addVariantImageMutation.mutateAsync({
                        productId: String(dialogProduct.productId),
                        variantId,
                        image: file,
                    });
                }}
            />

            <ConfirmDialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
                onConfirm={() => {
                    if (deleteConfirm) deleteProductMutation.mutate(deleteConfirm);
                    setDeleteConfirm(null);
                }}
                title={t("admin_confirm_delete_item", { name: products.find(p => String(p.productId) === deleteConfirm)?.name ?? "" })}
                confirmText={t("confirm")}
                cancelText={t("cancel")}
                variant="destructive"
            />
        </div>
    );
}
