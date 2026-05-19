"use client";

import {
    ChevronRight,
    PackageCheck,
    ShoppingCartIcon,
    Star,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AppError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks";
import { useCart } from "@/features/cart/hooks";
import { useProductFeedbacks } from "@/features/orders/hooks";
import {
    useCategories,
    useProductDetail,
    useProducts
} from "@/features/products/hooks";
import { Product } from "@/features/products/types";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";
import { formatCurrency, formatNumber } from "@/utils/format";

interface ProductDetailClientProps {
    id: string;
}

type TabKey = "details" | "specs" | "reviews";

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
    const { t, locale } = useLanguage();
    const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<{ productId: string; image: string } | null>(null);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<TabKey>("details");
    const [showFullDesc, setShowFullDesc] = useState(false);

    const { data: product, isLoading, error } = useProductDetail(id);
    const { addToCart, addToCartAsync, isAdding } = useCart();
    const { data: categories } = useCategories();

    const { data: relatedData } = useProducts({
        size: 4,
        ...(product?.category ? { keyword: product.category } : {})
    });
    const relatedProducts = relatedData?.items ?? [];

    const { data: feedbacksData } = useProductFeedbacks({
        productId: id,
        page: 0,
        size: 20
    });
    const feedbacks = feedbacksData?.data ?? [];

    if (isLoading) return <ProductDetailSkeleton />;

    if (error || !product) {
        if (error instanceof AppError && error.statusCode === 404) {
            router.push("/not-found");
            return null;
        }
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-foreground">{t('failed_to_load_product', {}, "Failed to load product")}</h2>
                <p className="text-muted-foreground mt-2">{(error as AppError)?.message || t('try_again_later', {}, "Please try again later.")}</p>
                <Button onClick={() => router.back()} className="mt-4" variant="outline">{t('go_back', {}, "Go back")}</Button>
            </div>
        );
    }

    const currentVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0];
    const images = currentVariant?.images?.length ? currentVariant.images : (product.variants?.[0]?.images || ["/placeholder.png"]);
    const currentImage = (selectedImage?.productId === id && selectedImage.image) ? selectedImage.image : images[0] || "/placeholder.png";

    const displayPrice = currentVariant?.priceAfterDiscount ?? product.displayPrice ?? 0;
    const originalPrice = currentVariant?.price ?? Number(product.displayPrice) * 1.2;
    const hasDiscount = originalPrice > displayPrice;

    const brandNameDisplay = product.brand || t('others', {}, "Others");
    const categoryNameDisplay = product.category || "";
    const matchedCategory = categories?.find((c) => c.name === categoryNameDisplay);
    const categoryLink = matchedCategory
        ? `/products?categoryId=${matchedCategory.categoryId}`
        : categoryNameDisplay ? `/products?name=${encodeURIComponent(categoryNameDisplay)}` : "/products";

    const productProperties = [
        { label: t('brand', {}, "Brand"), value: brandNameDisplay },
        { label: t('sku', {}, "SKU"), value: currentVariant?.variantId || product.productId.slice(0, 8).toUpperCase() },
        { label: t('category', {}, "Category"), value: categoryNameDisplay },
        { label: t('stock', {}, "Stock"), value: formatNumber(currentVariant?.stock || product.totalStock || 0, currentLocale) },
    ];

    const getVariantId = () => currentVariant?.variantId || "";

    const handleAddToCart = () => {
        if (!product) return;
        if (!isAuthenticated) { router.push("/login"); return; }
        const variantId = getVariantId();
        if (!variantId) { toast.error(t('no_variants', {}, "No variants available")); return; }
        addToCart({ productId: product.productId, variantId });
    };

    const handleBuyNow = async () => {
        if (!product) return;
        if (!isAuthenticated) { router.push("/login"); return; }
        const variantId = getVariantId();
        if (!variantId) { toast.error(t('no_variants', {}, "No variants available")); return; }
        try {
            await addToCartAsync({ productId: product.productId, variantId });
            router.push(`/cart?focusProduct=${product.productId}`);
        } catch (error) {
            toast.error(t(toErrorMessage(error, 'add_to_cart_failed'), {}, "Failed to add to cart. Please try again."));
        }
    };

    const tabs: { key: TabKey; label: string }[] = [
        { key: "details", label: t('tab_details', {}, "Details") },
        { key: "specs", label: t('tab_specs', {}, "Specs") },
        { key: "reviews", label: t('tab_reviews', {}, "Reviews") },
    ];

    const descriptionText = product.description || t('description_fallback', {}, "Product description will be updated soon.");

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <button onClick={() => router.push("/")} className="transition-colors hover:text-primary">{t('home', {}, "Home")}</button>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <button onClick={() => router.push(categoryLink)} className="text-primary transition-colors hover:text-primary/80">
                        {categoryNameDisplay || t('category', {}, "Category")}
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground truncate max-w-[200px]">{product.name}</span>
                </div>
            </div>

            {/* Product Card */}
            <div className="container mx-auto px-4 pb-6">
                <div className="bg-card rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div className="space-y-3">
                            <div className="relative aspect-[4/3] bg-accent rounded-xl overflow-hidden">
                                <Image src={currentImage} alt={product.name} fill className="object-contain p-6" priority unoptimized />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage({ productId: id, image: img })}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${currentImage === img ? "border-primary" : "border-transparent bg-accent hover:border-primary/40"}`}
                                    >
                                        <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-contain p-1.5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-xl lg:text-2xl font-semibold text-foreground leading-snug">{product.name}</h1>
                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                <span className="text-muted-foreground">{t('sku', {}, "SKU")} {product.productId.slice(0, 7).toUpperCase()}</span>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < Math.round(product.averageRating || 4)
                                                    ? "fill-primary text-primary"
                                                    : "fill-transparent text-[#D3D9E0]"
                                            }`}
                                        />
                                    ))}
                                </div>
                                {/* <span className="text-muted-foreground">({ratingCount})</span> */}
                            </div>

                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-2xl lg:text-3xl font-bold text-primary">{formatCurrency(displayPrice, 'VND', currentLocale)}</div>
                                    {hasDiscount && (
                                        <div className="text-sm text-muted-foreground line-through mt-0.5">{formatCurrency(originalPrice, 'VND', currentLocale)}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                                        <PackageCheck className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium text-foreground">{brandNameDisplay}</span>
                                    </div>
                                    {/* <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-primary/70 shrink-0" />
                                        <span>{formatNumber(viewedCount, currentLocale)} {t('viewed', {}, "Viewed")}</span>
                                    </div> */}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-sm text-muted-foreground">
                                {productProperties.map((prop) => (
                                    <div key={prop.label} className="flex items-center gap-2">
                                        <span className="text-foreground font-medium">{prop.label}:</span>
                                        <span>{prop.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Variant Selector */}
                            {product.variants && product.variants.length > 1 && (
                                <div className="space-y-3 py-2">
                                    <p className="text-sm font-semibold text-foreground uppercase tracking-wider">{t('select_variant', {}, "Select variant")}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((v, idx) => {
                                            const label = [v.color, v.storage].filter(Boolean).join(" - ") || v.variantId;
                                            const isSelected = selectedVariantIndex === idx;
                                            return (
                                                <button
                                                    key={v.variantId || idx}
                                                    onClick={() => {
                                                        setSelectedVariantIndex(idx);
                                                        if (v.images?.[0]) setSelectedImage({ productId: id, image: v.images[0] });
                                                    }}
                                                    className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${isSelected
                                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                            : "border-border bg-card text-muted-foreground hover:border-primary/40"
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAdding}
                                        className="flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-accent/40 text-primary hover:bg-accent transition-colors disabled:opacity-50"
                                    >
                                        <ShoppingCartIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={isAdding}
                                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto min-h-11"
                                >
                                    {t('buy_now', {}, "Mua ngay")} <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-card rounded-2xl mt-4 shadow-sm overflow-hidden min-h-banner-sm">
                    <div className="flex flex-col lg:flex-row h-full">
                        <div className="w-full lg:w-36 lg:border-r border-b lg:border-b-0 border-border flex lg:flex-col overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`text-left px-4 py-4 text-sm font-medium transition-colors border-l-2 flex-1 lg:flex-none ${activeTab === tab.key
                                        ? "border-primary text-primary bg-accent"
                                        : "border-transparent text-muted-foreground hover:text-primary hover:bg-muted/50"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 p-6 lg:p-8">
                            {activeTab === "details" && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {showFullDesc ? descriptionText : `${descriptionText.slice(0, 500)}...`}
                                    </p>
                                    {descriptionText.length > 500 && (
                                        <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-primary text-sm font-medium hover:underline">
                                            {showFullDesc ? t('show_less', {}, "Show less") : t('view_more', {}, "View more")}
                                        </button>
                                    )}
                                </div>
                            )}
                            {activeTab === "specs" && (
                                <div className="space-y-6">
                                    {currentVariant ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { label: t('color', {}, "Color"), value: currentVariant.color },
                                                { label: t('storage', {}, "Storage"), value: currentVariant.storage },
                                                { label: t('stock', {}, "Stock"), value: currentVariant.stock },
                                            ].filter(s => s.value).map((spec, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border/50">
                                                    <span className="text-sm font-medium text-foreground">{spec.label}</span>
                                                    <span className="text-sm text-muted-foreground">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: product.specsText || t('no_specs', {}, "No specifications available.") }}
                                        />
                                    )}
                                </div>
                            )}
                            {activeTab === "reviews" && (
                                <div className="space-y-6">
                                    {feedbacks.length > 0 ? (
                                        <div className="grid gap-6">
                                            {feedbacks.map((fb, i) => (
                                                <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-0.5">
                                                            {[...Array(5)].map((_, starIdx) => (
                                                                <Star
                                                                    key={starIdx}
                                                                    className={`w-3 h-3 ${
                                                                        starIdx < fb.rating
                                                                            ? "fill-primary text-primary"
                                                                            : "fill-transparent text-[#D3D9E0]"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-tiny text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString(currentLocale)}</span>
                                                    </div>
                                                    <p className="text-sm text-foreground">{fb.comment}</p>
                                                    <div className="text-tiny text-muted-foreground flex items-center gap-2">
                                                        <span>{t("variant", {}, "Variant")}: {fb.variantId}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                            <Star className="w-10 h-10 mb-2 opacity-20" />
                                            <p>{t('no_reviews', {}, "No reviews yet.")}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-foreground mb-4">{t('related_products', {}, "Related products")}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.filter((p: Product) => p.productId !== id).map((p: Product) => (
                            <ProductCard
                                key={p.productId}
                                id={p.productId}
                                title={p.name}
                                price={formatCurrency(Number(p.displayPrice) || 0, 'VND', currentLocale)}
                                rating={p.averageRating || 0}
                                image={p.variants?.[0]?.images?.[0] || "/placeholder.png"}
                                className="h-full"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-background animate-pulse">
            <div className="container mx-auto px-4 py-8 space-y-8">
                <Skeleton className="h-4 w-48" />
                <div className="bg-card rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="aspect-[4/3] rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-12 w-48 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
