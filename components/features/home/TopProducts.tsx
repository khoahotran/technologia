"use client"

import { useEffect, useState } from "react";
import { type ProductEntity } from "@/domain/product/entities/product.entity";
import { useProduct } from "@/application/use-cases/product/use-product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ProductCard } from "@/components/ui/product-card"

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

interface TopProductsProps {
  title?: string;
  className?: string;
}

export function TopProducts({ title = "Top products", className }: TopProductsProps) {
  const { getAll } = useProduct();
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAll();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch top products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <section className={`container mx-auto px-4 py-12 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products?.map((product) => (
            <CarouselItem key={product.productId} className="pl-4 md:basis-1/2 lg:basis-1/4">
              <ProductCard
                id={String(product.productId)}
                title={product.name}
                price={formatter.format(product.price)}
                rating={4}
                image={product.imageUrls?.[0] ?? "https://placehold.co/400x400"}
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
