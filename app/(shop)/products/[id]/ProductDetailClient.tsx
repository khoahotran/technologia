"use client"

import { ProductGallery } from "@/components/features/product/ProductGallery"
import { ProductInfo } from "@/components/features/product/ProductInfo"
import { ProductTabs } from "@/components/features/product/ProductTabs"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ProductDetailClient({ id: _id }: { id: string }) {
    // Mock Data
    const product = {
        title: "Product nameeeeeeeeeeeeeeeeeeeee",
        sku: "1062004",
        price: 106000000,
        originalPrice: 106106106,
        rating: 4,
        reviewCount: 106,
        soldCount: 1060,
        viewCount: 10600,
        images: [
            "https://placehold.co/600x600/e2e8f0/e2e8f0", // Placeholder color matching design
            "https://placehold.co/600x600/e2e8f0/e2e8f0",
            "https://placehold.co/600x600/e2e8f0/e2e8f0",
            "https://placehold.co/600x600/e2e8f0/e2e8f0",
        ],
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Breadcrumb>
                        <BreadcrumbList className="text-base font-medium text-gray-900">
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/" className="hover:text-primary">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-900 font-bold">
                                {">"}
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/products" className="hover:text-primary">Phone</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-900 font-bold">
                                {">"}
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-bold text-gray-900">Samsung Galaxy A23</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Product Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                    <ProductGallery images={product.images} />
                    <ProductInfo {...product} />
                </div>

                {/* Product Tabs Section */}
                <div className="mt-12">
                    <ProductTabs />
                </div>
            </div>
        </div>
    )
}
