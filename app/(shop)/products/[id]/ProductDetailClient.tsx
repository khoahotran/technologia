"use client";

import {
    Star,
    Minus,
    Plus,
    ShoppingCart,
    Heart,
    Share2,
    ShieldCheck,
    RotateCcw,
    Truck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductDetail, useProductList } from "@/hooks/use-products";
import { useCartStore } from "@/lib/stores"; // Using store directly or useCart hook
import { formatCurrency, formatNumber } from "@/shared/utils/format";

interface ProductDetailClientProps {
    id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { product, isLoading, error } = useProductDetail(id);

    // Use category name as keyword for related products if we don't have ID
    // This is a heuristic since we only have category name in ProductEntity
    const { products: relatedProducts } = useProductList({
        search: product?.category,
        size: 4,
    });

    const addToCart = useCartStore((state) => state.addItem);

    // Reset selected image when product changes
    useEffect(() => {
        setSelectedImage(null);
    }, [id]);

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Failed to load product</h2>
                <p className="text-gray-600 mt-2">
                    {error instanceof Error ? error.message : "Please try again later."}
                </p>
                <Button
                    onClick={() => router.back()}
                    className="mt-4"
                    variant="outline"
                >
                    Go Back
                </Button>
            </div>
        );
    }

    // Determine images (Variant images or default placeholder)
    const images =
        product.variants?.[0]?.images?.length
            ? product.variants[0].images
            : ["/placeholder.png"];

    const currentImage = selectedImage || images[0] || "/placeholder.png";

    const displayPrice = product.displayPrice || 0;
    // Mock original price if not provided
    const originalPrice = displayPrice * 1.2;

    const handleAddToCart = () => {
        addToCart(
            {
                id: product.productId,
                name: product.name,
                price: displayPrice,
                image: currentImage,
                rating: product.averageRating || 0,
                reviewCount: 0,
                category: product.category || "",
                brand: product.brand || "",
                description: product.description || "",
                specifications: {},
                inStock: (product.totalStock || 0) > 0,
                sku: product.productId,
            },
            quantity
        );
        toast.success("Added to cart!");
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4 text-sm text-gray-500">
                <button onClick={() => router.push("/")} className="hover:text-blue-600">
                    Home
                </button>{" "}
                &gt;{" "}
                <button
                    onClick={() => router.push(`/products?search=${product.category}`)}
                    className="hover:text-blue-600"
                >
                    {product.category || "Products"}
                </button>{" "}
                &gt; <span className="text-gray-900 font-medium">{product.name}</span>
            </div>

            <main className="container mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Image Gallery */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                                <Image
                                    src={currentImage}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-4"
                                    priority
                                />
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${currentImage === img
                                                ? "border-blue-500"
                                                : "border-transparent hover:border-gray-200"
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${idx}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Product Info */}
                        <div className="lg:col-span-7 space-y-6">
                            <div>
                                <div className="flex items-start justify-between">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                                        {product.name}
                                    </h1>
                                    <span className="flex items-center gap-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                                        <Heart className="w-6 h-6" />
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mt-2 text-sm">
                                    <div className="flex items-center text-yellow-400 gap-1">
                                        <span className="font-bold text-gray-900">
                                            {product.averageRating?.toFixed(1) || "5.0"}
                                        </span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.round(product.averageRating || 5)
                                                            ? "fill-current"
                                                            : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-500">
                                        SKU: {product.productId.slice(0, 8).toUpperCase()}
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-500">1.2k Sold</span>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-bold text-blue-600">
                                        {formatCurrency(displayPrice)}
                                    </span>
                                    <span className="text-lg text-gray-400 line-through mb-1">
                                        {formatCurrency(originalPrice)}
                                    </span>
                                    <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-none mb-1">
                                        -20%
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Short Specs / Properties */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Product Properties
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-500">Brand</span>
                                            <span className="font-medium text-gray-900">
                                                {product.brandName || "Generic"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-500">Warranty</span>
                                            <span className="font-medium text-gray-900">
                                                12 Months
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center gap-4 py-4">
                                    <span className="text-sm font-semibold text-gray-900">
                                        Quantity
                                    </span>
                                    <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-2 hover:bg-gray-50 transition-colors"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <span className="w-12 text-center font-medium text-gray-900">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-2 hover:bg-gray-50 transition-colors"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {formatNumber(product.totalStock || 100)} pieces available
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-2">
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg rounded-xl shadow-blue-200 shadow-lg"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Buy Now
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-12 w-12 rounded-xl border-gray-200 text-gray-500"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Service Assurance */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="bg-green-50 p-2 rounded-full text-green-600">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-gray-600 max-w-[100px]">
                                        100% Genuine Product
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                        <RotateCcw className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-gray-600 max-w-[100px]">
                                        7 Days Return Policy
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="bg-purple-50 p-2 rounded-full text-purple-600">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-gray-600 max-w-[100px]">
                                        Fast Delivery Nationwide
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Tabs */}
                    <div className="mt-12 lg:mt-16">
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
                                <TabsTrigger
                                    value="details"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-4 px-2 text-base"
                                >
                                    Description
                                </TabsTrigger>
                                <TabsTrigger
                                    value="specs"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-4 px-2 text-base"
                                >
                                    Specifications
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-4 px-2 text-base"
                                >
                                    Reviews ({Math.floor((product.averageRating || 0) * 100)})
                                </TabsTrigger>
                            </TabsList>
                            <div className="py-8">
                                <TabsContent
                                    value="details"
                                    className="prose max-w-none text-gray-600"
                                >
                                    <p>
                                        {product.description ||
                                            "No description available for this product."}
                                    </p>
                                    <p className="mt-4">
                                        Experience the next level of innovation with the{" "}
                                        {product.name}. Designed for performance and style, it matches
                                        your lifestyle perfectly.
                                    </p>
                                </TabsContent>
                                <TabsContent value="specs">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl text-sm">
                                        {product.specsText ? (
                                            <div
                                                dangerouslySetInnerHTML={{ __html: product.specsText }}
                                            />
                                        ) : (
                                            <>
                                                <div className="flex justify-between border-b py-2">
                                                    <span className="text-gray-500">Brand</span>
                                                    <span>{product.brandName}</span>
                                                </div>
                                                <div className="flex justify-between border-b py-2">
                                                    <span className="text-gray-500">SKU</span>
                                                    <span>{product.productId}</span>
                                                </div>
                                                <div className="flex justify-between border-b py-2">
                                                    <span className="text-gray-500">Stock</span>
                                                    <span>{formatNumber(product.totalStock)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="reviews">
                                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                                        No reviews yet. Be the first to review!
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    {/* Related Products */}
                    <div className="mt-12 lg:mt-16 border-t pt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Related Products
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts?.map((related) => (
                                <ProductCard
                                    key={related.productId}
                                    id={related.productId}
                                    title={related.name}
                                    price={formatCurrency(
                                        Number(related.displayPrice) || 0
                                    )}
                                    rating={related.averageRating || 0}
                                    image={
                                        related.variants?.[0]?.images?.[0] || "/placeholder.png"
                                    }
                                    badge={
                                        (related.totalStock || 0) < 10 ? "Low Stock" : undefined
                                    }
                                    className="hover:shadow-xl transition-shadow"
                                />
                            ))}
                            {!relatedProducts?.length && (
                                <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                                    No related products found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-4">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-7 space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        </div>
    );
}
