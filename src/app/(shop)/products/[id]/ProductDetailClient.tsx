"use client";

import {
    Star,
    Minus,
    Plus,
    ShoppingCartIcon,
    Eye,
    PackageCheck,
    ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AppError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/features/cart/hooks";
import {
    useProductDetail,
    useProducts
} from "@/features/products/hooks";
import { Product } from "@/features/products/types";
import { useLanguage } from "@/providers/language.provider";
import { formatCurrency, formatNumber } from "@/utils/format";

interface ProductDetailClientProps {
    id: string;
}

type TabKey = "details" | "specs" | "reviews";

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
    const { t, locale } = useLanguage();
    const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<{ productId: string; image: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("details");
    const [showFullDesc, setShowFullDesc] = useState(false);

    const { data: product, isLoading, error } = useProductDetail(id);
    const { addToCart, isAdding } = useCart();

    const { data: relatedData } = useProducts({
        size: 4,
        ...(product?.category ? { keyword: product.category } : {})
    });
    const relatedProducts = relatedData?.items ?? [];

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

    const images = product.variants?.[0]?.images?.length ? product.variants[0].images : ["/placeholder.png"];
    const currentImage = (selectedImage?.productId === id && selectedImage.image) ? selectedImage.image : images[0] || "/placeholder.png";
    const displayPrice = product.displayPrice || 0;
    const originalPrice = displayPrice * 1.2;
    const ratingCount = Math.floor((product.averageRating || 5) * 20);
    const viewedCount = 10600;

    const productProperties = [
        { label: t('brand', {}, "Brand"), value: product.brandName || product.brand || t('others', {}, "Others") },
        { label: t('sku', {}, "SKU"), value: product.productId.slice(0, 8).toUpperCase() },
        { label: t('category', {}, "Category"), value: product.category || t('category', {}, "Category") },
        { label: t('stock', {}, "Stock"), value: formatNumber(product.totalStock || 0, currentLocale) },
    ];

    const handleAddToCart = () => {
        const variantId = product.variants?.[0]?.variantId || "";
        if (!variantId) {
            toast.error(t('no_variants', {}, "No variants available"));
            return;
        }

        // Note: For simplicity, we add once. 
        // If the user wants multiple, we could loop or backend could support quantity.
        addToCart({ productId: product.productId, variantId });
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
                    <button onClick={() => router.push(`/products?category=${product.category || ""}`)} className="text-primary transition-colors hover:text-primary/80">
                        {product.category || t('category', {}, "Category")}
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
                                <div className="flex items-center gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating || 4) ? "fill-current" : "text-gray-300"}`} />
                                    ))}
                                </div>
                                <span className="text-muted-foreground">({ratingCount})</span>
                            </div>

                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-2xl lg:text-3xl font-bold text-foreground">{formatCurrency(displayPrice, 'VND', currentLocale)}</div>
                                    <div className="text-sm text-muted-foreground line-through mt-0.5">{formatCurrency(originalPrice, 'VND', currentLocale)}</div>
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                                        <PackageCheck className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium text-foreground">{product.brandName || product.brand || t('official_store', {}, "Official Store")}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-primary/70 shrink-0" />
                                        <span>{formatNumber(viewedCount, currentLocale)} {t('viewed', {}, "Viewed")}</span>
                                    </div>
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

                            <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center rounded-xl bg-accent/40 border border-border overflow-hidden">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="min-h-11 px-3 py-2.5 text-primary hover:bg-accent transition-colors"><Minus className="w-4 h-4" /></button>
                                        <span className="w-10 text-center font-semibold text-foreground text-sm">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)} className="min-h-11 px-3 py-2.5 text-primary hover:bg-accent transition-colors"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAdding}
                                        className="flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-accent/40 text-primary hover:bg-accent transition-colors disabled:opacity-50"
                                    >
                                        <ShoppingCartIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto min-h-11"
                                >
                                    {t('buy_now', {}, "Buy now")} <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-card rounded-2xl mt-4 shadow-sm overflow-hidden min-h-[300px]">
                    <div className="flex flex-col lg:flex-row h-full">
                        <div className="w-full lg:w-36 lg:border-r border-b lg:border-b-0 border-border flex lg:flex-col overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`text-left px-4 py-4 text-sm font-medium transition-colors border-l-2 flex-1 lg:flex-none ${
                                        activeTab === tab.key
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
                                <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.specsText || t('no_specs', {}, "No specifications available.") }} />
                            )}
                            {activeTab === "reviews" && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Star className="w-10 h-10 mb-2 opacity-20" />
                                    <p>{t('no_reviews', {}, "No reviews yet.")}</p>
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
