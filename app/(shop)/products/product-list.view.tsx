"use client";

import { Loader2, Flame, Trophy, Music, Smartphone, Laptop, Speaker, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useProductHook } from "@/presentation/hooks/use-product.hook";
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
    const [page, setPage] = useState(0); // 0-indexed
    const pageSize = 12;

    const [activeCategory, setActiveCategory] = useState("hot");

    // Parse filters from URL
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minStar = searchParams.get('minStar') ? Number(searchParams.get('minStar')) : undefined;
    const maxStar = searchParams.get('maxStar') ? Number(searchParams.get('maxStar')) : undefined;
    const sortParam = searchParams.get('sort'); // price_asc, price_desc, newest

    let sortBy = "price";
    let sortDirection = "ASC";

    if (sortParam === 'price_desc') {
        sortDirection = "DESC";
    } else if (sortParam === 'newest') {
        sortBy = "createdAt"; // Assuming createdAt exists, or handle in backend. Default to price for now if unsure.
        sortDirection = "DESC";
    }

    const { pagedProductsQuery } = useProductHook({
        page,
        size: pageSize,
        sortBy,
        sortDirection,
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice }),
        ...(minStar !== undefined && { minStar }),
        ...(maxStar !== undefined && { maxStar }),
        ...(searchParams.get('name') && { name: searchParams.get('name')! })
    });

    const { data: pagedData, isLoading, isError } = pagedProductsQuery;

    const products = pagedData?.data;
    const totalItems = pagedData?.total || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [minPrice, maxPrice, minStar, maxStar, sortParam, searchParams.get('name')]);

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
                Failed to load products. Ensure the Backend is running.
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
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${activeCategory === 'hot' ? 'bg-blue-100/50 text-blue-700' : 'bg-transparent text-gray-600'}`}
                                onClick={() => setActiveCategory('hot')}
                            >
                                <Flame className="w-5 h-5" />
                                Hot sales
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${activeCategory === 'best' ? 'bg-blue-100/50 text-blue-700' : 'bg-transparent text-gray-600'}`}
                                onClick={() => setActiveCategory('best')}
                            >
                                <Trophy className="w-5 h-5" />
                                Best Seller
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-md font-semibold ${activeCategory === 'new' ? 'bg-blue-100/50 text-blue-700' : 'bg-transparent text-gray-600'}`}
                                onClick={() => setActiveCategory('new')}
                            >
                                <Music className="w-5 h-5" />
                                New
                            </Button>
                        </div>

                        {/* Categories List */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-gray-900 px-4">Categories</h3>
                            <div className="flex flex-col gap-2">
                                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4">
                                    All Products
                                </Button>
                                <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4">
                                    <Smartphone className="w-4 h-4" /> Smartphones
                                </Button>
                                <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4">
                                    <Laptop className="w-4 h-4" /> Laptops
                                </Button>
                                {/* <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4">
                                    <Speaker className="w-4 h-4" /> Audio
                                </Button>
                                <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:text-primary hover:bg-blue-50/30 px-4">
                                    <MapPin className="w-4 h-4" /> Addresses
                                </Button> */}
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
                                    price={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    rating={4}
                                    image={product.imageUrls?.[0] ?? "https://placehold.co/400x400"}
                                    variant="default"
                                    {...(product.status === 'NEW' && { badge: 'New' })}
                                    className="w-full bg-white rounded-[1.5rem]"
                                />
                            ))}
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
