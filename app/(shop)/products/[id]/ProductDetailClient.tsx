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
import { isAppError, type AppError } from "@/domain/errors";
import { useAddToCartMutation, useProductDetail, useProductList } from "@/presentation/hooks";
import { formatCurrency, formatNumber } from "@/shared/utils/format";

interface ProductDetailClientProps {
    /** Mã định danh sản phẩm lấy từ URL params */
    id: string;
}

/** Các tab chuyển đổi hiển thị thông tin sản phẩm */
type TabKey = "chi-tiet" | "thong-so" | "danh-gia";

/**
 * Giao diện Chi tiết Sản phẩm (Product Detail Client)
 * 
 * Hiển thị đầy đủ thông tin về một sản phẩm cụ thể bao gồm hình ảnh, giá cả, 
 * thông số kỹ thuật, mô tả và cho phép người dùng thêm sản phẩm vào giỏ hàng.
 */
export default function ProductDetailClient({ id }: ProductDetailClientProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<{ productId: string; image: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("chi-tiet");
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
                <h2 className="text-2xl font-bold text-gray-900">Không tải được sản phẩm</h2>
                <p className="text-gray-600 mt-2">
                    {error instanceof Error ? error.message : "Vui lòng thử lại sau."}
                </p>
                <Button
                    onClick={() => router.back()}
                    className="mt-4"
                    variant="outline"
                >
                    Quay lại
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
        { label: "Thương hiệu", value: product.brandName || "Khác" },
        { label: "SKU", value: product.productId.slice(0, 8).toUpperCase() },
        { label: "Danh mục", value: product.category || "Sản phẩm" },
        { label: "Tồn kho", value: formatNumber(product.totalStock || 0) },
    ];

    const handleAddToCart = () => {
        const variantId = product.variants?.[0]?.variantId;
        if (!variantId) {
            toast.error("Sản phẩm chưa có biến thể");
            return;
        }

        const iterations = Math.max(1, quantity);
        let completed = 0;
        for (let i = 0; i < iterations; i += 1) {
            addToCartMutation.mutate(
                {
                    productId: product.productId,
                    variantId,
                },
                {
                    onSuccess: () => {
                        completed += 1;
                        if (completed === iterations) {
                            toast.success(`Đã thêm ${iterations} sản phẩm vào giỏ hàng`);
                        }
                    },
                    onError: (err: unknown) => {
                        let message = "Không thể thêm vào giỏ hàng.";
                        const appError = err as AppError;
                        if (appError?.details && typeof appError.details === 'object' && 'data' in (appError.details as object)) {
                            const data = (appError.details as { data?: { message?: string } }).data;
                            if (data?.message) message = data.message;
                        }
                        if (appError?.statusCode === 401) {
                            message = "Vui lòng đăng nhập để thêm vào giỏ hàng.";
                            router.push("/login");
                        }
                        toast.error(message);
                    },
                }
            );
        }
    };

    const tabs: { key: TabKey; label: string }[] = [
        { key: "chi-tiet", label: "Chi tiết" },
        { key: "thong-so", label: "Thông số" },
        { key: "danh-gia", label: "Đánh giá" },
    ];

    const descriptionText = product.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

    return (
        <div className="min-h-screen bg-[#EEF5FB]">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-3 text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                    <button
                        onClick={() => router.push("/")}
                        className="hover:text-blue-600 transition-colors"
                    >
                        Home
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <button
                        onClick={() => router.push(`/products?search=${product.category || ""}`)}
                        className="hover:text-blue-600 transition-colors"
                    >
                        {product.category || "Sản phẩm"}
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
                                    SKU {product.productId.slice(0, 7).toUpperCase()}
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
                                        {formatCurrency(displayPrice)}
                                    </div>
                                    <div className="text-sm text-gray-400 line-through mt-0.5">
                                        {formatCurrency(originalPrice)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <PackageCheck className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span>{formatNumber(soldCount)} Sold</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span>{formatNumber(viewedCount)} Viewed</span>
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
                                            aria-label="Giảm số lượng"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-semibold text-gray-800 text-sm">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-2.5 text-blue-600 hover:bg-blue-100 transition-colors"
                                            aria-label="Tăng số lượng"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {/* Cart icon button */}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addToCartMutation.isPending}
                                        className="flex items-center justify-center w-10 h-10 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                                        aria-label="Thêm vào giỏ hàng"
                                        title="Thêm vào giỏ hàng"
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
                                    Buy now
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
                            {activeTab === "chi-tiet" && (
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
                                            {showFullDesc ? "Thu gọn" : "View more"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "thong-so" && (
                                <div className="space-y-2 text-sm">
                                    {product.specsText ? (
                                        <div
                                            className="text-gray-600"
                                            dangerouslySetInnerHTML={{ __html: product.specsText }}
                                        />
                                    ) : (
                                        <>
                                            <div className="flex justify-between border-b py-2">
                                                <span className="text-gray-500">Thương hiệu</span>
                                                <span className="font-medium">{product.brandName || "—"}</span>
                                            </div>
                                            <div className="flex justify-between border-b py-2">
                                                <span className="text-gray-500">SKU</span>
                                                <span className="font-medium">{product.productId}</span>
                                            </div>
                                            <div className="flex justify-between border-b py-2">
                                                <span className="text-gray-500">Danh mục</span>
                                                <span className="font-medium">{product.category || "—"}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-500">Tồn kho</span>
                                                <span className="font-medium">{formatNumber(product.totalStock || 0)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === "danh-gia" && (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                    <Star className="w-10 h-10 mb-2 text-gray-200" />
                                    <p className="text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== Related Products ===== */}
                <div className="mt-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Related products</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedProducts?.filter((r) => r.productId !== product.productId).slice(0, 4).map((related) => (
                            <ProductCard
                                key={related.productId}
                                id={related.productId}
                                title={related.name}
                                price={formatCurrency(Number(related.displayPrice) || 0)}
                                rating={related.averageRating || 0}
                                image={related.variants?.[0]?.images?.[0] || "/placeholder.png"}
                                badge={(related.totalStock || 0) < 10 ? "Low Stock" : undefined}
                                className="hover:shadow-lg transition-shadow"
                            />
                        ))}
                        {!relatedProducts?.length && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                Không có sản phẩm liên quan.
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
