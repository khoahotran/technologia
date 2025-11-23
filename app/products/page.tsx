"use client"

import { ProductSidebar } from "@/components/features/product/ProductSidebar"
import { FilterBar } from "@/components/features/product/FilterBar"
import { ProductCard } from "@/components/ui/product-card"
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

export default function ProductFilterPage() {
  // Mock Products
  const products = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: "Product name 2 lines",
    price: "1.000.000",
    rating: 4,
    image: "https://placehold.co/400x400/e2e8f0/e2e8f0",
  }))

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
                <BreadcrumbPage className="font-bold text-gray-900">Product Filter</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ProductSidebar />

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Filter Bar */}
            <FilterBar />

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  price={product.price}
                  rating={product.rating}
                  variant="default"
                  className="w-full"
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink href="#" isActive className="h-10 w-10 border-gray-200 bg-gray-50">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="h-10 w-10 border-gray-200 hover:bg-gray-50">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="h-10 w-10 border-gray-200 hover:bg-gray-50">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" className="h-10 w-10 border-gray-200 hover:bg-gray-50" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  )
}
