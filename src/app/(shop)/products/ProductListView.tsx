"use client";

/**
 * Giao dien Danh sach San pham (Product List View)
 * 
 * Lap rap va tich hop cac thanh phan o trang danh sach san pham, 
 * quan ly trang thai (state) cho bo loc, phan trang, va goi cac custom hooks 
 * de tuong tac voi Backend (Lay danh sach san pham, danh muc, thuong hieu, them vao gio...).
 */
import { Loader2, Flame, Trophy, Music, Tag, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { FilterBar } from "@/components/features/product/FilterBar";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { ProductCard } from "@/components/ui/product-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks";
import { useCart } from "@/features/cart/hooks";
import {
    useProducts,
    useBrands,
    useCategories
} from "@/features/products/hooks";
import { useLanguage } from "@/providers/language.provider";

/**
 * Thanh phan chinh de hien thi Danh sach san pham
 */
export function ProductListView() {
    const { t, locale } = useLanguage();
    const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [page, setPage] = useState(0); // 0-indexed

    const pageSize = 12;

    const [activeCategory, setActiveCategory] = useState<number | string | undefined>(undefined);
    const [activeBrand, setActiveBrand] = useState<number | string | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'hot', 'best', 'new'
    const { addToCart } = useCart();

    // Parse filters from URL
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minStar = searchParams.get('minStar') ? Number(searchParams.get('minStar')) : undefined;
    const maxStar = searchParams.get('maxStar') ? Number(searchParams.get('maxStar')) : undefined;
    const sortParam = searchParams.get('sort'); // price_asc, price_desc, newest

    let sortBy = "created_at";
    let sortDirection = "DESC";

    if (sortParam === 'price_asc') {
        sortBy = "display_price";
        sortDirection = "ASC";
    } else if (sortParam === 'price_desc') {
        sortBy = "display_price";
        sortDirection = "DESC";
    } else if (sortParam === 'newest') {
        sortBy = "created_at";
        sortDirection = "DESC";
    }

    if (activeTab === 'new') {
        sortBy = "created_at";
        sortDirection = "DESC";
    }

    // Fetch Data
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();

    const params = {
        page,
        size: pageSize,
        sortBy,
        sortDirection: sortDirection as "ASC" | "DESC",
        minPrice,
        maxPrice,
        minRating: minStar,
        maxRating: maxStar,
        categoryId: activeCategory,
        brandId: activeBrand,
        keyword: searchParams.get('name') || undefined
    };

    // Remove undefined properties to make TS exactOptionalPropertyTypes happy
    const definedParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
    );

    const { data: productData, isLoading: isLoadingProducts, isError } = useProducts(definedParams);

    const products = productData?.items ?? [];
    const totalPages = productData?.totalPages ?? 0;
    const isLoading = isLoadingProducts;

    // Reset page when filters change
    useEffect(() => {
        const handle = setTimeout(() => setPage(0), 0);
        return () => clearTimeout(handle);
    }, [minPrice, maxPrice, minStar, maxStar, sortParam, activeCategory, activeBrand, activeTab]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="mb-6 flex items-center gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-3" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {[...Array(6)].map((_, index) => (
                                <Skeleton key={`filter-${index}`} className="h-10 w-full rounded-xl" />
                            ))}
                        </div>
                        <div className="lg:col-span-10 space-y-6">
                            <Skeleton className="h-14 w-full rounded-xl" />
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(8)].map((_, index) => (
                                    <Skeleton key={`product-${index}`} className="h-[320px] w-full rounded-3xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
                <Loader2 className="mb-3 h-7 w-7 text-destructive" />
                <p className="text-destructive">{t("cannot_load_products", {}, "Cannot load products right now.")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("retry_later", {}, "Please retry in a moment.")}
                </p>
            </div>
        );
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Smart Pagination Logic
    const getPaginationItems = () => {
        const items = [];
        const current = page + 1;
        const last = totalPages;

        if (last <= 7) {
            for (let i = 1; i <= last; i++) items.push(i);
        } else {
            items.push(1);
            if (current > 3) items.push('...');
            const start = Math.max(2, current - 1);
            const end = Math.min(last - 1, current + 1);
            for (let i = start; i <= end; i++) items.push(i);
            if (current < last - 2) items.push('...');
            items.push(last);
        }
        return items;
    };

    const currencyFormat = new Intl.NumberFormat(currentLocale, { style: 'currency', currency: 'VND' });

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary font-bold">{t('home', {}, "Home")}</Link>
                    <span>&gt;</span>
                    <span className="font-bold text-foreground">{t('product_filter', {}, "Product Filter")}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${
                                    activeTab === "all"
                                        ? "bg-accent text-primary"
                                        : "bg-transparent text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => { setActiveTab('all'); setActiveCategory(undefined); setActiveBrand(undefined); }}
                            >
                                <Tag className="w-5 h-5" /> {t('all_products', {}, "All Products")}
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${
                                    activeTab === "hot"
                                        ? "bg-accent text-primary"
                                        : "bg-transparent text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setActiveTab('hot')}
                            >
                                <Flame className="w-5 h-5" /> {t('hot_sales', {}, "Hot sales")}
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${
                                    activeTab === "best"
                                        ? "bg-accent text-primary"
                                        : "bg-transparent text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setActiveTab('best')}
                            >
                                <Trophy className="w-5 h-5" /> {t('best_seller', {}, "Best Seller")}
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${
                                    activeTab === "new"
                                        ? "bg-accent text-primary"
                                        : "bg-transparent text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setActiveTab('new')}
                            >
                                <Music className="w-5 h-5" /> {t('new', {}, "New")}
                            </Button>
                        </div>

                        {/* Categories List */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-foreground px-4">{t('categories', {}, "Categories")}</h3>
                            <div className="px-4 space-y-3">
                                <Select
                                    value={activeCategory ? String(activeCategory) : "all"}
                                    onValueChange={(val) => setActiveCategory(val === "all" ? undefined : Number(val))}
                                >
                                    <SelectTrigger className="w-full h-10 px-4 bg-card border border-border rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder={t('all_categories', {}, "All Categories")} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('all_categories', {}, "All Categories")}</SelectItem>
                                        {categories?.map((cat) => (
                                            <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="flex flex-col gap-2 pt-1 border-t border-border">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 py-1">{t('popular', {}, "Popular")}</p>
                                    {categories?.slice(0, 3).map((cat) => (
                                        <Button
                                            key={cat.categoryId}
                                            variant="ghost"
                                            className={`w-full justify-start gap-3 h-9 px-3 rounded-lg text-sm ${
                                                activeCategory === cat.categoryId
                                                    ? "font-bold text-primary bg-accent"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                            onClick={() => setActiveCategory(cat.categoryId)}
                                        >
                                            <Smartphone className="w-4 h-4 opacity-70" /> {cat.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Brands List */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-foreground px-4">{t('brands', {}, "Brands")}</h3>
                            <div className="px-4">
                                <Select
                                    value={activeBrand ? String(activeBrand) : "all"}
                                    onValueChange={(val) => setActiveBrand(val === "all" ? undefined : Number(val))}
                                >
                                    <SelectTrigger className="w-full h-10 px-4 bg-card border border-border rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder={t('all_brands', {}, "All Brands")} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('all_brands', {}, "All Brands")}</SelectItem>
                                        {brands?.map((brand) => (
                                            <SelectItem key={brand.brandId} value={String(brand.brandId)}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="flex flex-col gap-2 pt-1 border-t border-border">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 py-1">{t('popular', {}, "Popular")}</p>
                                    {brands?.slice(0, 3).map((brand) => (
                                        <Button
                                            key={brand.brandId}
                                            variant="ghost"
                                            className={`w-full justify-start gap-3 h-9 px-3 rounded-lg text-sm ${
                                                activeBrand === brand.brandId
                                                    ? "font-bold text-primary bg-accent"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                            onClick={() => setActiveBrand(brand.brandId)}
                                        >
                                            <Tag className="w-4 h-4 opacity-70" /> {brand.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-10 space-y-6">
                        <FilterBar />
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products?.map((product) => (
                                <ProductCard
                                    key={product.productId}
                                    id={String(product.productId)}
                                    title={product.name}
                                    price={product.displayPrice ? currencyFormat.format(product.displayPrice) : t('contact', {}, "Contact")}
                                    rating={product.averageRating || 0}
                                    image={product.variants?.[0]?.images?.[0] || "https://placehold.co/400x400"}
                                    variant="default"
                                    {...(product.status === 'NEW' && { badge: t('new', {}, "New") })}
                                    className="w-full bg-white rounded-[1.5rem]"
                                    onAddToCart={() => {
                                        if (!isAuthenticated) {
                                            router.push("/login");
                                            return;
                                        }
                                        const variantId = product.variants?.[0]?.variantId;
                                        if (!variantId) {
                                            toast.error(t('no_variants', {}, "Product has no available variant"));
                                            return;
                                        }
                                        addToCart(
                                            { productId: product.productId, variantId },
                                            {
                                                onError: () => {
                                                    toast.error(t('add_to_cart_failed', {}, "Failed to add to cart. Please try again."));
                                                }
                                            }
                                        );

                                    }}
                                />
                            ))}
                            {products?.length === 0 && (
                                <div className="col-span-full text-center py-20 text-muted-foreground">
                                    {t('no_products_found', {}, "No products found matching your criteria.")}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
                                                className={page === 0 ? 'pointer-events-none opacity-50' : ''}
                                            />
                                        </PaginationItem>
                                        {getPaginationItems().map((item, index) => (
                                            <PaginationItem key={index}>
                                                {item === '...' ? <PaginationEllipsis /> : (
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={page === (Number(item) - 1)}
                                                        onClick={(e) => { e.preventDefault(); handlePageChange(Number(item) - 1); }}
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
                                                className={page === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


