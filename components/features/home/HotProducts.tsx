"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ui/product-card"
import { useProducts } from "@/hooks/use-products";

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function HotProducts() {
  const { usePagedProducts } = useProducts();
  // Fetch 12 hottest products (assuming sort by views/sold/rating)
  // Using "id" DESC as a placeholder for "hot", typically you'd sort by 'views' or 'sold'
  const { data, isLoading } = usePagedProducts(0, 12, "id", "DESC");

  const products = data?.data || [];

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12 bg-gray-50/50 rounded-3xl mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Hot products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[350px] bg-white animate-pulse rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 bg-gray-50/50 rounded-3xl mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Hot products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            id={String(product.productId)}
            title={product.name}
            price={product.displayPrice ? formatter.format(product.displayPrice) : "Contact"}
            rating={product.averageRating || 0}
            image={product.variants?.[0]?.images?.[0] || "https://placehold.co/400x400"}
            variant="default"
            className="w-full bg-white"
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8 bg-accent text-accent-foreground hover:bg-accent/80 border-none shadow-none font-bold text-base h-12">
            View more
          </Button>
        </Link>
      </div>
    </section>
  )
}
