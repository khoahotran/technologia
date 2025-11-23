"use client"

import { ProductCard } from "@/components/ui/product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function TopProducts() {
  // Mock Products
  const products = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    title: "Product name 2 lines",
    price: "1.000.000",
    rating: 4,
    image: "https://placehold.co/400x400/e2e8f0/e2e8f0",
  }))

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Top products</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
              <ProductCard
                title={product.title}
                price={product.price}
                rating={product.rating}
                variant="default"
                className="w-full"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  )
}
