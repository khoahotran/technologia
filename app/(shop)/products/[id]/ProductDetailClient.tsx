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

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { isAppError } from "@/domain/errors";
import { getErrorMessageForUI } from "@/infrastructure/http";
import { useAddToCartMutation, useProductDetail, useProductList } from "@/presentation/hooks";
import { useLanguage } from "@/shared/providers/language.provider";
import type { ApiError } from '@/shared/types';
import { formatCurrency, formatNumber } from "@/shared/utils/format";
import { safe } from "@/shared/utils/result";

interface ProductDetailClientProps {
    /** Mã định danh sản phẩm lấy từ URL params */
    id: string;
}

/** Các tab chuyển đổi hiển thị thông tin sản phẩm */
type TabKey = "details" | "specs" | "reviews";

/**
 * Giao diện Chi tiết Sản phẩm (Product Detail Client)
 * 
 * Hiển thị đầy đủ thông tin về một sản phẩm cụ thể bao gồm hình ảnh, giá cả, 
 * thông số kỹ thuật, mô tả và cho phép người dùng thêm sản phẩm vào giỏ hàng.
 */
export default function ProductDetailClient({ id }: ProductDetailClientProps) {
    const { t, locale } = useLanguage();
    const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<{ productId: string; image: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("details");
    const [showFullDesc, setShowFullDesc] = useState(false);

    const { product, isLoading, error } = useProductDetail(id);
    const addToCartMutation = useAddToCartMutation();

    const { products: relatedProducts } = useProductList({
        size: 4,
        ...(product?.category ? { search: product.category } : {})
    });

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        if (
            isAppError(error) &&
            error.statusCode === 404
        ) {
            router.push("/not-found");
            return null;
        }

        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t('failed_to_load_product', {}, "Failed to load product")}</h2>
                <p className="text-gray-600 mt-2">
                    {error instanceof Error ? error.message : t('try_again_later', {}, "Please try again later.")}
                </p>
                <Button
                    onClick={() => router.back()}
                    className="mt-4"
                    variant="outline"
                >
                    {t('go_back', {}, "Go back")}
                </Button>
            </div>
        );
    }

    const images =
        product.variants?.[0]?.images?.length
            ? product.variants[0].images
            : ["/placeholder.png"];

    const currentImage =
        selectedImage?.productId === id && selectedImage.image
            ? selectedImage.image
            : images[0] || "/placeholder.png";

    const displayPrice = product.displayPrice || 0;
    const originalPrice = displayPrice * 1.2;

    const ratingCount = Math.floor((product.averageRating || 5) * 20);
    const soldCount = 1060;
    const viewedCount = 10600;

    const productProperties = [
        { label: t('brand', {}, "Brand"), value: product.brandName || t('others', {}, "Others") },
        { label: t('sku', {}, "SKU"), value: product.productId.slice(0, 8).toUpperCase() },
        { label: t('category', {}, "Category"), value: product.category || t('category', {}, "Category") },
        { label: t('stock', {}, "Stock"), value: formatNumber(product.totalStock || 0, currentLocale) },
    ];

    const handleAddToCart = async () => {
        const variantId = product.variants?.[0]?.variantId;
        if (!variantId) {
            toast.error(t('no_variants', {}, "No variants available"));
            return;
        }

        const iterations = Math.max(1, quantity);
        let successCount = 0;

        // Thực hiện thêm từng đơn vị sản phẩm một cách tuần tự (Sequential)
        // Backend hiện tại chỉ hỗ trợ tăng 1 đơn vị mỗi lần gọi API
        for (let i = 0; i < iterations; i += 1) {
            const [, err] = await safe(addToCartMutation.mutateAsync({
                productId: product.productId,
                variantId,
            }));

            if (err) {
                const appError = err as ApiError;
                console.error('[Add To Cart Error Detail]', appError);

                // Xử lý lỗi đặc thù: Chưa đăng nhập (401)
                // @ts-expect-error statusCode comes from mapped API errors
                if (appError?.statusCode === 401) {
                    toast.error(t('login_required_action', {}, "Please login to perform this action."));
                    router.push("/login");
                    return;
                }

                // Xử lý lỗi đặc thù: Không có quyền (403)
                // @ts-expect-error statusCode comes from mapped API errors
                if (appError?.statusCode === 403) {
                    // Nếu đã đăng nhập mà vẫn 403, có thể là lỗi phân quyền backend
                    toast.error(t('permission_denied_cart', {}, "You don't have permission to add items to cart. Please check your account."));
                    return;
                }

                // Trích xuất message thân thiện cho UI cho các lỗi khác
                const message = getErrorMessageForUI(appError);
                toast.error(message);
                return; // Stop on first error

            }


            successCount += 1;
        }

        if (successCount > 0) {
            toast.success(t('added_n_to_cart', { count: successCount }, `Added ${successCount} products to cart`));
        }
    };

    const tabs: { key: TabKey; label: string }[] = [
        { key: "details", label: t('tab_details', {}, "Details") },
        { key: "specs", label: t('tab_specs', {}, "Specs") },
        { key: "reviews", label: t('tab_reviews', {}, "Reviews") },
    ];

    const descriptionText = product.description || t('description_fallback', {}, "Product description will be updated soon.");

    return (
        <div className="min-h-screen bg-[#EEF5FB]">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-3 text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                    <button
                        onClick={() => router.push("/")}
                        className="hover:text-blue-600 transition-colors"
                    >
                        {t('home', {}, "Home")}
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <button
                        onClick={() => router.push(`/products?search=${product.category || ""}`)}
                        className="hover:text-blue-600 transition-colors text-blue-600"
                    >
                        {product.category || t('category', {}, "Category")}
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">
                        {product.name}
                    </span>
                </div>
            </div>

            {/* Product Card */}
            <div className="container mx-auto px-4 pb-6">
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* ===== LEFT: Image Gallery ===== */}
                        <div className="space-y-3">
                            {/* Main Image */}
                            <div className="relative aspect-[4/3] bg-[#D9E6F2] rounded-xl overflow-hidden">
                                <Image
                                    src={currentImage}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-6"
                                    priority
                                />
                            </div>
                            {/* Thumbnails */}
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage({ productId: id, image: img })}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${currentImage === img
                                            ? "border-[#3B82F6]"
                                            : "border-transparent bg-[#D9E6F2] hover:border-blue-300"
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            className="object-contain p-1.5"
                                        />
                                    </button>
                                ))}
                                {/* Placeholder thumbnails if fewer than 4 images */}
                                {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, idx) => (
                                    <div
                                        key={`ph-${idx}`}
                                        className="aspect-square rounded-lg bg-[#D9E6F2]"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ===== RIGHT: Product Info ===== */}
                        <div className="space-y-4">
                            {/* Name */}
                            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                {product.name}
                            </h1>

                            {/* SKU + Stars + Review count */}
                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                <span className="text-gray-500">
                                    {t('sku', {}, "SKU")} {product.productId.slice(0, 7).toUpperCase()}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.round(product.averageRating || 4)
                                                ? "fill-current"
                                                : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-500">({ratingCount})</span>
                            </div>

                            {/* Price + Sold & Viewed */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                                        {formatCurrency(displayPrice, 'VND', currentLocale)}
                                    </div>
                                    <div className="text-sm text-gray-400 line-through mt-0.5">
                                        {formatCurrency(originalPrice, 'VND', currentLocale)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <PackageCheck className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span>{formatNumber(soldCount, currentLocale)} {t('sold', {}, "Sold")}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span>{formatNumber(viewedCount, currentLocale)} {t('viewed', {}, "Viewed")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Properties */}
                            <div className="space-y-1.5 text-sm text-gray-600">
                                {productProperties.map((prop) => (
                                    <div key={prop.label} className="flex items-center gap-2">
                                        <span className="text-gray-700 font-medium">{prop.label}:</span>
                                        <span>{prop.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Quantity + Add to Cart + Buy Now */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-3">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center rounded-xl bg-blue-50 border border-blue-200 overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-2.5 text-blue-600 hover:bg-blue-100 transition-colors"
                                            aria-label={t('show_less', {}, "Show less")}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-semibold text-gray-800 text-sm">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-2.5 text-blue-600 hover:bg-blue-100 transition-colors"
                                            aria-label={t('view_more', {}, "View more")}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {/* Cart icon button */}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addToCartMutation.isPending}
                                        className="flex items-center justify-center w-10 h-10 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                                        aria-label={t('add_to_cart_aria', { title: product.name })}
                                        title={t('add_to_cart_aria', { title: product.name })}
                                    >
                                        <ShoppingCartIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Buy Now */}
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={addToCartMutation.isPending}
                                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {t('buy_now', {}, "Buy now")}
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== Tabs Section ===== */}
                <div className="bg-white rounded-2xl mt-4 shadow-sm overflow-hidden">
                    <div className="flex">
                        {/* Tab List — vertical on left */}
                        <div className="w-32 lg:w-36 shrink-0 border-r border-gray-100 flex flex-col py-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`text-left px-4 py-4 text-sm font-medium transition-colors border-l-2 ${activeTab === tab.key
                                        ? "border-blue-500 text-blue-600 bg-blue-50"
                                        : "border-transparent text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 p-6 lg:p-8 min-h-[200px]">
                            {activeTab === "details" && (
                                <div>
                                    <p className="text-sm text-gray-600 leading-relaxed text-center">
                                        {showFullDesc
                                            ? descriptionText
                                            : `${descriptionText.slice(0, 350)}...`}
                                    </p>
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setShowFullDesc(!showFullDesc)}
                                            className="text-blue-500 text-sm font-medium hover:underline"
                                        >
                                            {showFullDesc ? t('show_less', {}, "Show less") : t('view_more', {}, "View more")}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "specs" && (
                                <div className="space-y-2 text-sm">
                                    {product.specsText ? (
                                        <div
                                            className="text-gray-600"
                                            dangerouslySetInnerHTML={{ __html: product.specsText }}
                                        />
                                    ) : (
                                        <>
                                            <div className="flex justify-between border-b py-2">
                                                <span className="text-gray-500">{t('brand', {}, "Brand")}</span>
                                                <span className="font-medium">{product.brandName || "—"}</span>
                                            </div>
                                            <div className="flex justify-between border-b py-2">
                                                <span className="text-gray-500">{t('sku', {}, "SKU")}</span>
                                                <span className="font-medium">{product.productId}</span>
                                            </div>
                                            <div className="flex justify-between border-b py-2">
                                                <span className="text-gray-500">{t('category', {}, "Category")}</span>
                                                <span className="font-medium">{product.category || "—"}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-500">{t('stock', {}, "Stock")}</span>
                                                <span className="font-medium">{formatNumber(product.totalStock || 0, currentLocale)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === "reviews" && (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                    <Star className="w-10 h-10 mb-2 text-gray-200" />
                                    <p className="text-sm">{t('no_reviews', {}, "No reviews yet. Be the first!")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== Related Products ===== */}
                <div className="mt-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('related_products', {}, "Related products")}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedProducts?.filter((r) => r.productId !== product.productId).slice(0, 4).map((related) => (
                            <ProductCard
                                key={related.productId}
                                id={related.productId}
                                title={related.name}
                                price={formatCurrency(Number(related.displayPrice) || 0, 'VND', currentLocale)}
                                rating={related.averageRating || 0}
                                image={related.variants?.[0]?.images?.[0] || "/placeholder.png"}
                                badge={(related.totalStock || 0) < 10 ? t('low_stock', {}, "Low Stock") : undefined}
                                className="hover:shadow-lg transition-shadow"
                            />
                        ))}
                        {!relatedProducts?.length && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                {t('no_related_products', {}, "No related products.")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#EEF5FB]">
            <div className="container mx-auto px-4 py-3">
                <Skeleton className="h-4 w-56" />
            </div>
            <div className="container mx-auto px-4 pb-6">
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="aspect-square rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-10 w-1/3" />
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>
                            <Skeleton className="h-10 w-40 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

