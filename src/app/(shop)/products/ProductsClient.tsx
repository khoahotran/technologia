"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { FilterBar } from "@/components/features/product/FilterBar"
import { ProductSidebar } from "@/components/features/product/ProductSidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { ProductCard } from "@/components/ui/product-card"
import { useProducts } from "@/features/products/hooks"
import { useLanguage } from "@/providers/language.provider"
import { formatCurrency } from "@/utils/format"

export default function ProductsClient() {
    const { locale } = useLanguage()
    const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US'
    const searchParams = useSearchParams()
    const [page, setPage] = useState(0)

    // Parse filters from URL
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort") || "price_asc"
    const categoryId = searchParams.get("categoryId")
    const brandId = searchParams.get("brandId")

    // Map sort string to API params
    const sortMapping: Record<string, { sortBy: string, sortDirection: 'ASC' | 'DESC' }> = {
        "price_asc": { sortBy: "price", sortDirection: "ASC" },
        "price_desc": { sortBy: "price", sortDirection: "DESC" },
        "newest": { sortBy: "createdAt", sortDirection: "DESC" },
    }
    const selectedSort = sortMapping[sort] ?? sortMapping["price_asc"]!
    const { sortBy, sortDirection } = selectedSort

    // Reset page when filters change
    useEffect(() => {
        const handle = setTimeout(() => setPage(0), 0)
        return () => clearTimeout(handle)
    }, [minPrice, maxPrice, sort, categoryId, brandId])

    const { data, isLoading, isError, error } = useProducts({
        page,
        size: 12,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        sortDirection,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
    })
    const products = data?.items ?? []
    const totalPages = data?.totalPages ?? 0

    const pagination = useMemo(() => {
        const pages = new Set<number>([0, Math.max(totalPages - 1, 0), page - 1, page, page + 1])
        return Array.from(pages).filter((value) => value >= 0 && value < totalPages).sort((a, b) => a - b)
    }, [page, totalPages])

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-8">
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
                                <BreadcrumbPage className="font-bold text-gray-900">Products</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <ProductSidebar />

                    <div className="flex-1 space-y-8">
                        <FilterBar />

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
                                {error instanceof Error ? error.message : "Failed to load products."}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.productId}
                                        id={product.productId}
                                        title={product.name}
                                        price={formatCurrency(Number(product.displayPrice) || 0, 'VND', currentLocale)}
                                        rating={product.averageRating || 0}
                                        image={product.variants?.[0]?.images?.[0] || "/placeholder.png"}
                                        variant="default"
                                        className="w-full"
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault()
                                                setPage((current) => Math.max(current - 1, 0))
                                            }}
                                        />
                                    </PaginationItem>
                                    {(pagination[0] ?? 0) > 0 && (
                                        <>
                                            <PaginationItem>
                                                <PaginationLink href="#" onClick={(event) => { event.preventDefault(); setPage(0) }}>1</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        </>
                                    )}
                                    {pagination.map((pageNumber) => (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink
                                                href="#"
                                                isActive={pageNumber === page}
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    setPage(pageNumber)
                                                }}
                                            >
                                                {pageNumber + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    {(pagination[pagination.length - 1] ?? 0) < totalPages - 1 && (
                                        <>
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#" onClick={(event) => { event.preventDefault(); setPage(totalPages - 1) }}>{totalPages}</PaginationLink>
                                            </PaginationItem>
                                        </>
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault()
                                                setPage((current) => Math.min(current + 1, Math.max(totalPages - 1, 0)))
                                            }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
