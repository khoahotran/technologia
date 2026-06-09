import { SmallLoading } from "@/components/shared/loading";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdateProductDiscountRequest } from "@/features/discounts/admin-types";
import { useBrands, useCategories, useProductDetail, useProducts } from "@/features/products/hooks";
import { useLanguage } from "@/providers/language.provider";
import { cn } from "@/utils/cn";

interface ProductVariantSelection {
    productId: string;
    productName: string;
    variantIds: string[];
}

interface ApplyProductsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    discountName: string;
    onApply: (payload: UpdateProductDiscountRequest) => void;
    isPending: boolean;
}

/**
 * Component to pick a single product from a searchable list
 */
function ProductPicker({
    selectedProductId,
    onSelect
}: {
    selectedProductId: string;
    onSelect: (id: string, name: string) => void
}) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data: productData, isLoading } = useProducts({
        keyword: search.trim() || undefined,
        size: 5
    });

    const selectedProduct = useMemo(() => {
        if (!selectedProductId) return null;
        return productData?.items.find(p => p.productId === selectedProductId);
    }, [selectedProductId, productData]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between rounded-xl h-9 text-xs"
                >
                    <span className="truncate">
                        {selectedProduct ? selectedProduct.name : t("admin_select_product")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={t("admin_search_product")}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {isLoading && <div className="p-4 flex justify-center"><SmallLoading className="h-4 w-4" /></div>}
                        {!isLoading && (!productData || productData.items.length === 0) && (
                            <CommandEmpty>{t("admin_no_products_found")}</CommandEmpty>
                        )}
                        <CommandGroup>
                            {productData?.items.map((product) => (
                                <CommandItem
                                    key={product.productId}
                                    value={product.productId}
                                    onSelect={() => {
                                        onSelect(product.productId, product.name);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-3 w-3",
                                            selectedProductId === product.productId ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {product.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

/**
 * Component to pick multiple variants of a selected product
 */
function VariantPicker({
    productId,
    selectedVariantIds,
    onChange
}: {
    productId: string;
    selectedVariantIds: string[];
    onChange: (ids: string[]) => void
}) {
    const { t } = useLanguage();
    const { data: product, isLoading } = useProductDetail(productId);

    if (!productId) return null;
    if (isLoading) return <Skeleton className="h-9 w-full rounded-xl" />;
    if (!product || !product.variants || product.variants.length === 0) {
        return <div className="text-[10px] text-muted-foreground p-2">{t("admin_no_variants")}</div>;
    }

    const toggleVariant = (vId: string) => {
        const newIds = selectedVariantIds.includes(vId)
            ? selectedVariantIds.filter(id => id !== vId)
            : [...selectedVariantIds, vId];
        onChange(newIds);
    };

    return (
        <div className="grid grid-cols-1 gap-1.5 p-2 border rounded-xl bg-muted/20">
            <p className="text-[10px] font-bold text-muted-foreground uppercase px-1 mb-1">
                {t("admin_select_variants")}
            </p>
            {product.variants.map((v) => {
                const vId = v.variantId || "";
                const label = `${v.color || ""} ${v.storage || ""}`.trim() || vId;
                return (
                    <div key={vId} className="flex items-center gap-2 px-1">
                        <Checkbox
                            id={`v-${vId}`}
                            checked={selectedVariantIds.includes(vId)}
                            onCheckedChange={() => toggleVariant(vId)}
                        />
                        <label
                            htmlFor={`v-${vId}`}
                            className="text-xs cursor-pointer select-none truncate flex-1"
                        >
                            {label}
                        </label>
                    </div>
                );
            })}
        </div>
    );
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
    const [productSelections, setProductSelections] = useState<ProductVariantSelection[]>([]);
    const [brandPopoverOpen, setBrandPopoverOpen] = useState(false);
    const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setSelectedBrandIds([]);
            setSelectedCategoryIds([]);
            setProductSelections([]);
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

    const addProductSelection = () => {
        setProductSelections((prev) => [...prev, { productId: "", productName: "", variantIds: [] }]);
    };

    const removeProductSelection = (index: number) => {
        setProductSelections((prev) => prev.filter((_, i) => i !== index));
    };

    const updateProductSelection = (index: number, updates: Partial<ProductVariantSelection>) => {
        setProductSelections((prev) =>
            prev.map((selection, i) => (i === index ? { ...selection, ...updates } : selection))
        );
    };

    const handleApply = () => {
        const payload: UpdateProductDiscountRequest = {};
        if (selectedBrandIds.length > 0) payload.brandIds = selectedBrandIds;
        if (selectedCategoryIds.length > 0) payload.categoryIds = selectedCategoryIds;

        const allVariantEntries: { productId: string; variantId: string }[] = [];
        productSelections.forEach(selection => {
            selection.variantIds.forEach(vId => {
                allVariantEntries.push({
                    productId: selection.productId,
                    variantId: vId
                });
            });
        });

        if (allVariantEntries.length > 0) {
            payload.productVariantIds = allVariantEntries;
        }
        onApply(payload);
    };

    const hasSelection =
        selectedBrandIds.length > 0 ||
        selectedCategoryIds.length > 0 ||
        productSelections.some((s) => s.productId && s.variantIds.length > 0);

    const selectedBrands = brands.filter((b) => selectedBrandIds.includes(Number(b.brandId)));
    const selectedCategories = categories.filter((c) => selectedCategoryIds.includes(Number(c.categoryId)));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {t("admin_apply_discount_to", { name: discountName })}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("admin_filter_brand")}</label>
                        <Popover open={brandPopoverOpen} onOpenChange={setBrandPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={brandPopoverOpen}
                                    className="w-full justify-between rounded-xl"
                                >
                                    {selectedBrandIds.length > 0
                                        ? t("admin_products_chose", { count: selectedBrandIds.length })
                                        : t("admin_select_brands")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder={t("admin_search_here")} />
                                    <CommandList>
                                        <CommandEmpty>{t("admin_no_brands")}</CommandEmpty>
                                        <CommandGroup>
                                            {brands.map((brand) => {
                                                const id = Number(brand.brandId);
                                                return (
                                                    <CommandItem
                                                        key={id}
                                                        value={brand.name}
                                                        onSelect={() => toggleBrand(id)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedBrandIds.includes(id)
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {brand.name}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {selectedBrands.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedBrands.map((brand) => (
                                    <Badge
                                        key={brand.brandId}
                                        variant="secondary"
                                        className="rounded-full text-xs"
                                    >
                                        {brand.name}
                                        <button
                                            className="ml-1 hover:text-destructive"
                                            onClick={() => toggleBrand(Number(brand.brandId))}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("admin_filter_category")}</label>
                        <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={categoryPopoverOpen}
                                    className="w-full justify-between rounded-xl"
                                >
                                    {selectedCategoryIds.length > 0
                                        ? t("admin_products_chose", { count: selectedCategoryIds.length })
                                        : t("admin_select_categories")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder={t("admin_search_here")} />
                                    <CommandList>
                                        <CommandEmpty>{t("admin_no_categories")}</CommandEmpty>
                                        <CommandGroup>
                                            {categories.map((cat) => {
                                                const id = Number(cat.categoryId);
                                                return (
                                                    <CommandItem
                                                        key={id}
                                                        value={cat.name}
                                                        onSelect={() => toggleCategory(id)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCategoryIds.includes(id)
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {cat.name}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedCategories.map((cat) => (
                                    <Badge
                                        key={cat.categoryId}
                                        variant="secondary"
                                        className="rounded-full text-xs"
                                    >
                                        {cat.name}
                                        <button
                                            className="ml-1 hover:text-destructive"
                                            onClick={() => toggleCategory(Number(cat.categoryId))}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">{t("admin_add_products")}</label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addProductSelection}
                                className="rounded-xl text-xs h-7"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                {t("admin_add")}
                            </Button>
                        </div>
                        {productSelections.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {t("admin_no_items")}
                            </p>
                        ) : (
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                                {productSelections.map((selection, index) => (
                                    <div key={index} className="space-y-2 p-3 border rounded-2xl bg-surface relative group">
                                        <button
                                            onClick={() => removeProductSelection(index)}
                                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                                {t("admin_product")}
                                            </label>
                                            <ProductPicker
                                                selectedProductId={selection.productId}
                                                onSelect={(id, name) => updateProductSelection(index, { productId: id, productName: name, variantIds: [] })}
                                            />
                                        </div>

                                        {selection.productId && (
                                            <VariantPicker
                                                productId={selection.productId}
                                                selectedVariantIds={selection.variantIds}
                                                onChange={(ids) => updateProductSelection(index, { variantIds: ids })}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleApply} disabled={!hasSelection || isPending} className="rounded-xl">
                        {isPending ? t("applying") : t("admin_apply")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
