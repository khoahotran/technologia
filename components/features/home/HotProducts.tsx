"use client"

import { useEffect, useState } from "react";
import Link from "next/link"
import { type ProductEntity } from "@/domain/product/entities/product.entity";
import { useProduct } from "@/application/use-cases/product/use-product";

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ui/product-card"

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function HotProducts() {
  const { getAll } = useProduct();
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAll();
        // Limit to 12 items for the grid
        setProducts(data.slice(0, 12));
      } catch (error) {
        console.error("Failed to fetch hot products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [getAll]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
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
            rating={4}
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
