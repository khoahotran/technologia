"use client"

import Link from "next/link"
import { ProductCard } from "@/components/ui/product-card"
import { Button } from "@/components/ui/button"

export function HotProducts() {
  // Mock Products
  const products = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: "Product name 2 lines",
    price: "1.000.000",
    rating: 4,
    image: "https://placehold.co/400x400/e2e8f0/e2e8f0",
  }))

  return (
    <section className="container mx-auto px-4 py-12 bg-gray-50/50 rounded-3xl mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Hot products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            price={product.price}
            rating={product.rating}
            variant="default"
            className="w-full bg-white"
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8 bg-blue-100 text-blue-600 hover:bg-blue-200 border-none shadow-none font-semibold">
            View more
          </Button>
        </Link>
      </div>
    </section>
  )
}
