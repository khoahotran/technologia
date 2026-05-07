"use client";

import { Bell, CirclePlus, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    useAddProductVariantAdmin,
    useAddVariantImageAdmin,
    useApplyProductsToDiscountAdmin,
    useBrands,
    useCategories,
    useCreateProductAdmin,
    useDeleteProductAdmin,
    useProducts,
    useUpdateProductAdmin,
} from "@/features/products/hooks";
import type { Brand, Category, Product, ProductStatus } from "@/features/products/types";
import { useLanguage } from "@/providers/language.provider";

function currencyVnd(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value);
}

function parsePositiveNumber(value: string, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function toIdFromFilter(value: string) {
    if (value === "all") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

function askValue(label: string, initialValue = "") {
    const value = window.prompt(label, initialValue);
    if (value === null) return null;
    return value.trim();
}

function getBrandId(product: Product, brands: Brand[], selectedBrandId: string) {
    const directSelected = toIdFromFilter(selectedBrandId);
    if (directSelected !== null) return directSelected;
    const byName = brands.find((entry) => entry.name === (product.brandName ?? product.brand));
    if (byName) return Number(byName.brandId);
    if (brands[0]) return Number(brands[0].brandId);
    return null;
}

function getCategoryId(product: Product, categories: Category[], selectedCategoryId: string) {
    const directSelected = toIdFromFilter(selectedCategoryId);
    if (directSelected !== null) return directSelected;
    const byName = categories.find((entry) => entry.name === product.category);
    if (byName) return Number(byName.categoryId);
    if (categories[0]) return Number(categories[0].categoryId);
    return null;
}

function ProductTile({
    id,
    name,
    price,
    rating,
    selected,
    menuOpen,
    onToggle,
    onToggleMenu,
    onAction,
}: {
    id: string;
    name: string;
    price: number;
    rating: number;
    selected: boolean;
    menuOpen: boolean;
    onToggle: () => void;
    onToggleMenu: () => void;
    onAction: (action: "view" | "edit" | "remove" | "apply" | "upload") => void;
}) {
    const { t } = useLanguage();
    return (
        <article
            className={`relative h-[380px] rounded-[44px] border p-6 flex flex-col justify-end ${
                selected ? "border-[5px] border-[#3E93B3]" : "border-[3px] border-[#76B8D7]"
            }`}
        >
            <Checkbox
                checked={selected}
                onCheckedChange={onToggle}
                className="absolute left-6 top-6 h-8 w-8 border-[#4CA8D0]"
            />

            <div className="space-y-2">
                <p className="text-2xl md:text-3xl font-semibold text-[#1E1E1E] leading-tight">{name}</p>
                <p className="text-xl md:text-2xl text-[#1E1E1E] leading-tight">
                    {t("admin_product_two_lines", {}, "2 lines")}
                </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={`${id}-${star}`}
                            className={`h-7 w-7 ${
                                star <= rating ? "fill-[#3E93B3] text-[#3E93B3]" : "text-[#C4DCEE] fill-[#C4DCEE]"
                            }`}
                        />
                    ))}
                </div>
                <span className="text-2xl md:text-3xl text-[#1E1E1E]">{currencyVnd(price)}</span>
            </div>

            <button
                type="button"
                onClick={onToggleMenu}
                className="absolute right-6 bottom-8 h-12 w-12 rounded-full bg-[#3E93B3] text-white inline-flex items-center justify-center"
            >
                <SlidersHorizontal className="h-6 w-6" />
            </button>

            {menuOpen && (
                <div className="absolute right-12 top-20 bg-white border border-[#AAB3BC] shadow-[0_4px_8px_rgba(0,0,0,0.18)] z-10 min-w-28">
                    <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-xl hover:bg-[#EDF4F8]"
                        onClick={() => onAction("view")}
                    >
                        {t("admin_action_view", {}, "View")}
                    </button>
                    <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-xl hover:bg-[#EDF4F8]"
                        onClick={() => onAction("edit")}
                    >
                        {t("admin_action_edit", {}, "Edit")}
                    </button>
                    <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-xl hover:bg-[#EDF4F8]"
                        onClick={() => onAction("remove")}
                    >
                        {t("admin_action_remove", {}, "Remove")}
                    </button>
                    <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-xl hover:bg-[#EDF4F8]"
                        onClick={() => onAction("apply")}
                    >
                        {t("admin_action_apply", {}, "Apply")}
                    </button>
                    <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-xl hover:bg-[#EDF4F8]"
                        onClick={() => onAction("upload")}
                    >
                        {t("admin_action_upload_image", {}, "Upload image")}
                    </button>
                </div>
            )}
        </article>
    );
}

export default function AdminProductsClient() {
    const { t } = useLanguage();
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState<string>("all");
    const [brandId, setBrandId] = useState<string>("all");
    const [minPrice, setMinPrice] = useState<string>("0");
    const [maxPrice, setMaxPrice] = useState<string>("100000");
    const [sortBy, setSortBy] = useState<string>("displayPrice");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
    const [uploadTarget, setUploadTarget] = useState<{ productId: string; variantId: string } | null>(null);
    const uploadInputRef = useRef<HTMLInputElement | null>(null);

    const createProductMutation = useCreateProductAdmin();
    const updateProductMutation = useUpdateProductAdmin();
    const deleteProductMutation = useDeleteProductAdmin();
    const addVariantMutation = useAddProductVariantAdmin();
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
            { label: "0 VND", value: "0" },
            { label: "100.000 VND", value: "100000" },
            { label: "500.000 VND", value: "500000" },
            { label: "1.000.000 VND", value: "1000000" },
        ],
        []
    );

    const isBusy =
        createProductMutation.isPending ||
        updateProductMutation.isPending ||
        deleteProductMutation.isPending ||
        addVariantMutation.isPending ||
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
            toast.error(t("admin_create_product_requires_brand_category", {}, "Brand and category are required"));
            return;
        }
        const fallbackBrand = brands[0];
        const fallbackCategory = categories[0];
        if (!fallbackBrand || !fallbackCategory) {
            toast.error(t("admin_create_product_requires_brand_category", {}, "Brand and category are required"));
            return;
        }

        const name = askValue(t("admin_product_name", {}, "Product name"), "");
        if (!name) return;
        const description = askValue(t("description", {}, "Description"), "") ?? "";
        const displayPrice = parsePositiveNumber(
            askValue(t("admin_price", {}, "Price"), "1000000") ?? "",
            1000000
        );
        const stock = parsePositiveNumber(askValue(t("stock", {}, "Stock"), "10") ?? "", 10);
        const variantCode =
            askValue(t("admin_variant_code", {}, "Variant code"), `${name.replace(/\s+/g, "-").toUpperCase()}-1`) ??
            `${name.replace(/\s+/g, "-").toUpperCase()}-1`;
        const storage = askValue(t("storage", {}, "Storage"), "128GB") ?? "128GB";
        const color = askValue(t("color", {}, "Color"), "Black") ?? "Black";
        const statusInput = (askValue(t("status", {}, "Status"), "ACTIVE") ?? "ACTIVE").toUpperCase();
        const status: ProductStatus = statusInput === "INACTIVE" ? "INACTIVE" : "ACTIVE";

        const selectedBrandId = toIdFromFilter(brandId) ?? Number(fallbackBrand.brandId);
        const selectedCategoryId = toIdFromFilter(categoryId) ?? Number(fallbackCategory.categoryId);

        createProductMutation.mutate({
            name,
            description,
            displayPrice,
            brandId: selectedBrandId,
            categoryId: selectedCategoryId,
            status,
            variants: [
                {
                    variantCode,
                    price: displayPrice,
                    stock,
                    storage,
                    color,
                    images: [],
                },
            ],
        });
    };

    const handleAction = (action: "view" | "edit" | "remove" | "apply" | "upload", productId: string) => {
        setMenuOpenFor(null);
        const selectedProduct = products.find((item) => String(item.productId) === productId);

        if (!selectedProduct) {
            toast.error(t("admin_product_not_found", {}, "Product not found"));
            return;
        }

        if (action === "view") {
            window.open(`/products/${productId}`, "_blank", "noopener,noreferrer");
            return;
        }

        if (action === "remove") {
            if (!window.confirm(t("admin_confirm_delete_item", { name: selectedProduct.name }, "Delete {name}?"))) {
                return;
            }
            deleteProductMutation.mutate(productId);
            return;
        }

        if (action === "apply") {
            const variantCode = askValue(t("admin_variant_code", {}, "Variant code"), `VAR-${Date.now()}`);
            if (!variantCode) return;
            const price = parsePositiveNumber(
                askValue(t("admin_price", {}, "Price"), String(selectedProduct.displayPrice ?? 0)) ?? "",
                Number(selectedProduct.displayPrice ?? 0)
            );
            const stock = parsePositiveNumber(askValue(t("stock", {}, "Stock"), "10") ?? "", 10);
            const storage = askValue(t("storage", {}, "Storage"), "128GB") ?? "128GB";
            const color = askValue(t("color", {}, "Color"), "Black") ?? "Black";
            addVariantMutation.mutate({
                productId,
                payload: {
                    variantCode,
                    price,
                    stock,
                    storage,
                    color,
                    images: [],
                },
            });
            return;
        }

        if (action === "upload") {
            const firstVariant = selectedProduct.variants?.find((variant) => Boolean(variant.variantId));
            if (!firstVariant?.variantId) {
                toast.error(t("admin_variant_missing_for_upload", {}, "No variant available for image upload"));
                return;
            }
            setUploadTarget({ productId, variantId: firstVariant.variantId });
            uploadInputRef.current?.click();
            return;
        }

        const nextName = askValue(t("admin_product_name", {}, "Product name"), selectedProduct.name);
        if (!nextName) return;
        const nextDescription = askValue(
            t("description", {}, "Description"),
            selectedProduct.description ?? ""
        );
        if (nextDescription === null) return;
        const nextPrice = parsePositiveNumber(
            askValue(
                t("admin_price", {}, "Price"),
                String(selectedProduct.displayPrice ?? 0)
            ) ?? "",
            Number(selectedProduct.displayPrice ?? 0)
        );
        const statusInput = (
            askValue(t("status", {}, "Status"), selectedProduct.status ?? "ACTIVE") ?? selectedProduct.status ?? "ACTIVE"
        ).toUpperCase();
        const status: ProductStatus = statusInput === "INACTIVE" ? "INACTIVE" : "ACTIVE";
        const resolvedBrandId = getBrandId(selectedProduct, brands, brandId);
        const resolvedCategoryId = getCategoryId(selectedProduct, categories, categoryId);

        if (resolvedBrandId === null || resolvedCategoryId === null) {
            toast.error(t("admin_create_product_requires_brand_category", {}, "Brand and category are required"));
            return;
        }

        updateProductMutation.mutate({
            productId,
            payload: {
                name: nextName,
                description: nextDescription,
                displayPrice: nextPrice,
                brandId: resolvedBrandId,
                categoryId: resolvedCategoryId,
                status,
            },
        });
    };

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
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
            <div className="max-w-[760px] mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-7 w-7 text-[#1E1E1E]" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("admin_search_here", {}, "Search here")}
                    className="h-[62px] pl-14 rounded-full bg-[#C9D8E5] border-[#C9D8E5] text-lg md:text-2xl"
                />
            </div>

            <div className="grid lg:grid-cols-5 gap-4">
                <div>
                    <p className="text-lg md:text-2xl mb-2">{t("admin_filter_category", {}, "Category")}</p>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="h-[66px] bg-[#C9DDF0] border-[#C9DDF0] rounded-[18px] text-lg md:text-2xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("admin_all", {}, "All")}</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={String(category.categoryId)} value={String(category.categoryId)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className="text-lg md:text-2xl mb-2">{t("admin_filter_brand", {}, "Brand")}</p>
                    <Select value={brandId} onValueChange={setBrandId}>
                        <SelectTrigger className="h-[66px] bg-[#C9DDF0] border-[#C9DDF0] rounded-[18px] text-lg md:text-2xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("admin_all", {}, "All")}</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={String(brand.brandId)} value={String(brand.brandId)}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className="text-lg md:text-2xl mb-2">{t("admin_filter_min_price", {}, "Min price")}</p>
                    <Select value={minPrice} onValueChange={setMinPrice}>
                        <SelectTrigger className="h-[66px] bg-[#C9DDF0] border-[#C9DDF0] rounded-[18px] text-lg md:text-2xl">
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
                    <p className="text-lg md:text-2xl mb-2">{t("admin_filter_max_price", {}, "Max price")}</p>
                    <Select value={maxPrice} onValueChange={setMaxPrice}>
                        <SelectTrigger className="h-[66px] bg-[#C9DDF0] border-[#C9DDF0] rounded-[18px] text-lg md:text-2xl">
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
                    <p className="text-lg md:text-2xl mb-2">{t("admin_filter_order", {}, "Order")}</p>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-[66px] bg-[#C9DDF0] border-[#C9DDF0] rounded-[18px] text-lg md:text-2xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="displayPrice">{t("admin_order_price", {}, "Price")}</SelectItem>
                            <SelectItem value="createdAt">{t("admin_order_created_date", {}, "Created date")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid lg:grid-cols-[auto_1fr] gap-6">
                <button
                    type="button"
                    onClick={handleCreateProduct}
                    disabled={isBusy}
                    className="h-[90px] px-10 rounded-[30px] border-[3px] border-[#3E93B3] flex items-center gap-4 text-2xl md:text-4xl font-semibold disabled:opacity-60"
                >
                    <CirclePlus className="h-9 w-9" />
                    <span>{t("admin_add_product", {}, "Add product")}</span>
                </button>

                <div className="h-[90px] px-8 rounded-[30px] border-[3px] border-[#3E93B3] flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5 text-lg md:text-3xl">
                        <Bell className="h-7 w-7 text-[#5D6070]" />
                        <span>{t("admin_products_chose", { count: selectedCount }, "{count} chose")}</span>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={allOnPageSelected}
                                onCheckedChange={(value) => toggleSelectAllCurrentPage(Boolean(value))}
                            />
                            <span>{t("admin_select_all_page", {}, "Select all page")}</span>
                        </div>
                        {selectedCount > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    const discountId = askValue(
                                        t("admin_discount_id_prompt", {}, "Discount ID"),
                                        ""
                                    );
                                    if (!discountId) return;
                                    applyDiscountMutation.mutate({ discountId, productIds: selectedIds });
                                }}
                                disabled={isBusy}
                                className="h-12 px-5 rounded-full bg-[#3E93B3] text-white flex items-center gap-3 text-base md:text-xl font-semibold disabled:opacity-60"
                            >
                                {t("admin_apply_discount", {}, "Apply Discount")}
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <span className="text-lg md:text-3xl">1</span>
                </div>
            </div>

            {productQuery.isLoading ? (
                <div className="py-20 text-center text-xl text-[#556070]">
                    {t("admin_loading_products", {}, "Loading products...")}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-8">
                    {products.map((product) => {
                        const id = String(product.productId);
                        return (
                            <ProductTile
                                key={id}
                                id={id}
                                name={product.name}
                                price={product.displayPrice ?? 0}
                                rating={Math.max(1, Math.round(product.averageRating ?? 4))}
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

            <div className="flex justify-center pt-2">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(event) => {
                                    event.preventDefault();
                                    setPage((prev) => Math.max(prev - 1, 0));
                                }}
                            />
                        </PaginationItem>
                        {Array.from({ length: Math.max(totalPages, 3) })
                            .slice(0, 3)
                            .map((_, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href="#"
                                        isActive={page === index}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setPage(index);
                                        }}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(event) => {
                                    event.preventDefault();
                                    setPage((prev) => Math.min(prev + 1, Math.max(totalPages - 1, 0)));
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
