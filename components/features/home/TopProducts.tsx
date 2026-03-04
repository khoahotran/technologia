"use client"

/**
 * Thành phần Sản phẩm Hàng đầu (Top Products Component)
 * 
 * Truy xuất danh sách sản phẩm và hiển thị dưới dạng Carousel (băng chuyền)
 * có tự động trượt, dùng để làm nổi bật các sản phẩm được đánh giá cao hoặc bán chạy.
 */
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { ProductCard } from "@/components/ui/product-card"
import { useProductList } from "@/presentation/hooks";

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

interface TopProductsProps {
  /** 
   * Tiêu đề của khu vực hiển thị (Mặc định: "Sản phẩm hàng đầu").
   * Thiết kế động để có thể tái sử dụng cho các mục lục khác nhau.
   */
  title?: string;
  /** Class CSS tùy chỉnh thêm */
  className?: string;
}

export function TopProducts({ title = "Sản phẩm hàng đầu", className }: TopProductsProps) {
  // Lấy danh sách 10 sản phẩm có đánh giá trung bình cao nhất
  const { products, isLoading } = useProductList({ page: 0, size: 10, sortBy: "averageRating", sortDirection: "DESC" });

  if (isLoading) {
    return (
      <section className={`container mx-auto px-4 py-12 ${className}`}>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
          {/* Vùng xương hiển thị (Loading Skeleton) mô phỏng cấu trúc lưới dạng 4 cột */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`container mx-auto px-4 py-12 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>

      {/* Thành phần Carousel bọc danh mục sản phẩm, cấu hình tự động trượt sau 2s */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem key={product.productId} className="pl-4 md:basis-1/2 lg:basis-1/4">
              <ProductCard
                id={String(product.productId)}
                title={product.name}
                price={product.displayPrice ? formatter.format(product.displayPrice) : "Liên hệ"}
                rating={product.averageRating || 0}
                image={product.variants?.[0]?.images?.[0] || "https://placehold.co/400x400"}
                variant="default"
                className="w-full"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
