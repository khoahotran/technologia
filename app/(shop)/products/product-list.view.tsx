"use client";

import { Loader2, Flame, Trophy, Music, Smartphone, Laptop, Speaker, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { useProductHook } from "@/presentation/hooks/use-product.hook";
import { useCategoryHook } from "@/presentation/hooks/use-category.hook";
import { useBrandHook } from "@/presentation/hooks/use-brand.hook";
import { FilterBar } from "@/components/features/product/FilterBar";
import { ProductCard } from "@/components/ui/product-card";
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

export default function ProductListView() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [page, setPage] = useState(0); // 0-indexed
    const pageSize = 12;

    const [activeCategory, setActiveCategory] = useState<number | undefined>(undefined);
    const [activeBrand, setActiveBrand] = useState<number | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'hot', 'best', 'new'

    // Parse filters from URL
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minStar = searchParams.get('minStar') ? Number(searchParams.get('minStar')) : undefined;
    const maxStar = searchParams.get('maxStar') ? Number(searchParams.get('maxStar')) : undefined;
    const sortParam = searchParams.get('sort'); // price_asc, price_desc, newest

    let sortBy = "createdAt";
    let sortDirection = "DESC";

    if (sortParam === 'price_asc') {
        sortBy = "displayPrice";
        sortDirection = "ASC";
    } else if (sortParam === 'price_desc') {
        sortBy = "displayPrice";
        sortDirection = "DESC";
    } else if (sortParam === 'newest') {
        sortBy = "createdAt";
        sortDirection = "DESC";
    }

    // Handle "Hot", "Best", "New" tabs override
    if (activeTab === 'hot') {
        // sortBy = "soldCount"; // Example
    } else if (activeTab === 'new') {
        sortBy = "createdAt";
        sortDirection = "DESC";
    }

    // Fetch Data
    const { categoriesQuery } = useCategoryHook();
    const { brandsQuery } = useBrandHook();

    const { pagedProductsQuery } = useProductHook({
        page,
        size: pageSize,
        sortBy,
        sortDirection,
        minPrice,
        maxPrice,
        minRating: minStar, // Map core UI 'minStar' to API 'minRating'
        maxRating: maxStar,
        categoryId: activeCategory, // Use local state for now, ideally URL
        brandId: activeBrand,
        keyword: searchParams.get('name') || undefined
    });

    const { data: pagedData, isLoading, isError } = pagedProductsQuery;
    const products = pagedData?.data;
    const totalItems = pagedData?.count_items || 0;
    const totalPages = pagedData?.count_pages || 0;

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [minPrice, maxPrice, minStar, maxStar, sortParam, activeCategory, activeBrand, activeTab]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center text-destructive">
                Failed to load products. Ensure the Backend is running (Products: 8082).
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
        const current = page + 1; // 1-indexed for display
        const last = totalPages;

        if (last <= 7) {
            for (let i = 1; i <= last; i++) {
                items.push(i);
            }
        } else {
            items.push(1);
            if (current > 3) items.push('...');

            const start = Math.max(2, current - 1);
            const end = Math.min(last - 1, current + 1);

            for (let i = start; i <= end; i++) {
                items.push(i);
            }

            if (current < last - 2) items.push('...');
            items.push(last);
        }
        return items;
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary font-bold">Home</Link>
                    <span>&gt;</span>
                    <span className="font-bold text-foreground">Product Filter</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Filter Buttons */}
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${activeTab === 'all' ? 'bg-blue-100/50 text-blue-700' : 'bg-transparent text-gray-600'}`}
                                onClick={() => { setActiveTab('all'); setActiveCategory(undefined); setActiveBrand(undefined); }}
                            >
                                <Tag className="w-5 h-5" />
                                All Products
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${activeTab === 'hot' ? 'bg-blue-100/50 text-blue-700' : 'bg-transparent text-gray-600'}`}
                                onClick={() => setActiveTab('hot')}
                            >
                                <Flame className="w-5 h-5" />
                                Hot sales
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${activeTab === 'best' ? 'bg-blue-100/50 text-blue-700' : 'bg-transparent text-gray-600'}`}
                                onClick={() => setActiveTab('best')}
                            >
                                <Trophy className="w-5 h-5" />
                                Best Seller
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${activeTab === 'new' ? 'bg-blue-100/50 text-blue-700' : 'bg-transparent text-gray-600'}`}
                                onClick={() => setActiveTab('new')}
                            >
                                <Music className="w-5 h-5" />
                                New
                            </Button>
                        </div>

                        {/* Categories List */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-gray-900 px-4">Categories</h3>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4 ${activeCategory === undefined ? 'font-bold text-primary' : ''}`}
                                    onClick={() => setActiveCategory(undefined)}
                                >
                                    All Categories
                                </Button>
                                {categoriesQuery.data?.map((cat) => (
                                    <Button
                                        key={cat.categoryId}
                                        variant="ghost"
                                        className={`w-full justify-start gap-3 text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4 ${activeCategory === cat.categoryId ? 'font-bold text-primary bg-blue-50' : ''}`}
                                        onClick={() => setActiveCategory(cat.categoryId)}
                                    >
                                        <Smartphone className="w-4 h-4" /> {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Brands List */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-gray-900 px-4">Brands</h3>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4 ${activeBrand === undefined ? 'font-bold text-primary' : ''}`}
                                    onClick={() => setActiveBrand(undefined)}
                                >
                                    All Brands
                                </Button>
                                {brandsQuery.data?.map((brand) => (
                                    <Button
                                        key={brand.brandId}
                                        variant="ghost"
                                        className={`w-full justify-start gap-3 text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4 ${activeBrand === brand.brandId ? 'font-bold text-primary bg-blue-50' : ''}`}
                                        onClick={() => setActiveBrand(brand.brandId)}
                                    >
                                        {brand.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-10 space-y-6">
                        {/* Filter Bar */}
                        <FilterBar />

                        {/* Product Grid */}
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products?.map((product) => (
                                <ProductCard
                                    key={product.productId}
                                    id={String(product.productId)}
                                    title={product.name}
                                    price={product.displayPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.displayPrice) : "Contact"}
                                    rating={product.averageRating || 0}
                                    image={product.variants?.[0]?.images?.[0] || "https://placehold.co/400x400"}
                                    variant="default"
                                    {...(product.status === 'NEW' && { badge: 'New' })}
                                    className="w-full bg-white rounded-[1.5rem]"
                                />
                            ))}
                            {products?.length === 0 && (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    No products found matching your criteria.
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
                                                className={`h-10 rounded-lg ${page === 0 ? 'pointer-events-none opacity-50' : ''}`}
                                            />
                                        </PaginationItem>

                                        {getPaginationItems().map((item, index) => (
                                            <PaginationItem key={index}>
                                                {item === '...' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={page === (Number(item) - 1)}
                                                        onClick={(e) => { e.preventDefault(); handlePageChange(Number(item) - 1); }}
                                                        className="h-10 w-10 rounded-lg"
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
                                                className={`h-10 rounded-lg ${page === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}`}
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
