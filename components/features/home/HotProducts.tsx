"use client"

/**
 * Thành phần Sản phẩm Nổi bật (Hot Products Component)
 * 
 * Truy xuất và hiển thị danh sách các sản phẩm đang được quan tâm nhất 
 * (hiện tại logic mẫu đang lấy danh sách mới nhất với sortDirection: "DESC").
 * Có xử lý trạng thái Loading Skeleton trong lúc lấy dữ liệu.
 */
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ui/product-card"
import { useProductList } from "@/presentation/hooks";
import { useLanguage } from "@/shared/providers/language.provider";



export function HotProducts() {
  const { t, locale } = useLanguage();
  const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  const formatter = new Intl.NumberFormat(currentLocale, { style: 'currency', currency: 'VND' });
  // Lấy dữ liệu sản phẩm từ Hook (trang 0, lấy 12 sản phẩm)
  const { products, isLoading } = useProductList({ page: 0, size: 12, sortBy: "id", sortDirection: "DESC" });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12 bg-gray-50/50 rounded-3xl mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('hot_products', {}, "Hot Products")}</h2>
        {/* Loading Skeleton giả lập giao diện dạng lưới của danh sách sản phẩm */}
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
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('hot_products', {}, "Hot Products")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            id={String(product.productId)}
            title={product.name}
            price={product.displayPrice ? formatter.format(product.displayPrice) : t('contact', {}, "Contact")}
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
            {t('view_more', {}, "View more")}
          </Button>
        </Link>
      </div>
    </section>
  )
}
