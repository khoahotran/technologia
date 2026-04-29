"use client";

/**
 * Thành phần Thẻ Sản phẩm (Product Card Component)
 * 
 * Hiển thị thông tin tóm tắt của một sản phẩm bao gồm hình ảnh, tên, giá, và đánh giá.
 * Hỗ trợ nhiều biến thể: mặc định, nhỏ gọn (compact), và có thể chọn (selectable).
 */
import { Check, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { useLanguage } from "@/providers/language.provider";
import { cn } from "@/utils/cn";

// ===========================================
// Types
// ===========================================

interface ProductCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  /** ID sản phẩm phục vụ điều hướng */
  id?: string | number | undefined;
  /** Tiêu đề / Tên sản phẩm */
  title: string;
  /** Giá sản phẩm (Chuỗi đã được định dạng) */
  price: string;
  /** Điểm đánh giá (0-5) */
  rating?: number | undefined;
  /** URL hình ảnh sản phẩm */
  image?: string | undefined;
  /** Biến thể hiển thị (default: chuẩn, compact: hàng ngang, selectable: có ô chọn) */
  variant?: "default" | "compact" | "selectable" | undefined;
  /** Trạng thái đang được chọn (dùng cho variant selectable) */
  isSelected?: boolean | undefined;
  /** Sự kiện khi nhấn vào ô chọn */
  onSelect?: (() => void) | undefined;
  /** Văn bản hiển thị trên huy hiệu (VD: "Giảm giá", "Mới") */
  badge?: string | undefined;
  /** Sự kiện khi nhấn nút Thêm vào giỏ hàng */
  onAddToCart?: (() => void) | undefined;
}

// ===========================================
// Component
// ===========================================

/**
 * Thành phần ProductCard
 */
export function ProductCard({
  className,
  id,
  title,
  price,
  rating = 4,
  image,
  variant = "default",
  isSelected,
  onSelect,
  badge,
  onAddToCart,
  ...props
}: ProductCardProps) {
  const { t } = useLanguage();
  const router = useRouter();

  /** Chuyển hướng sang trang chi tiết khi nhấn nút hoặc nhấn vào thẻ */
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      router.push(`/products/${id}`);
    }
  };

  /** Xử lý thêm vào giỏ hàng */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.();
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "bg-white border-transparent hover:border-primary/20 pt-0",
        isSelected && "ring-2 ring-primary border-primary", // Hiển thị viền nhấn mạnh nếu đang được chọn
        className
      )}
      {...props}
    >
      {/* 1. Huy hiệu (Badge) - Góc trên bên phải */}
      {badge && variant === "default" && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="font-semibold rounded-full px-3">
            {badge}
          </Badge>
        </div>
      )}

      {/* 2. Ô chọn (Selection Checkbox) - Góc trên bên trái */}
      {(variant === "selectable" || isSelected !== undefined) && (
        <button
          type="button"
          aria-checked={isSelected}
          role="checkbox"
          className={cn(
            "absolute top-3 left-3 z-10 h-5 w-5 rounded-full border border-primary",
            "bg-white flex items-center justify-center cursor-pointer",
            "transition-colors hover:bg-primary/10",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary"
          )}
          onClick={onSelect}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
          <span className="sr-only">{t('select_product', { title })}</span>
        </button>
      )}

      <CardContent
        className={cn(
          "p-0 h-full flex flex-col",
          variant === "compact" && "flex-row items-center p-4 gap-4"
        )}
      >
        {/* 3. Hình ảnh Sản phẩm */}
        {variant !== "compact" && (
          <div className="aspect-square w-full bg-muted/30 flex items-center justify-center relative group p-6">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              // Trạng thái dự phòng khi không có ảnh
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                <div className="w-16 h-16 rounded-full bg-muted/30" />
              </div>
            )}
          </div>
        )}

        {/* 4. Thông tin Sản phẩm (Tên, Đánh giá, Giá) */}
        <div className={cn("flex flex-col flex-1", variant !== "compact" && "p-5")}>
          <div className="mb-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors min-h-[2.5em]">
              {title}
            </h3>
          </div>

          <div className="mt-auto">
            {/* Đánh giá sao */}
            <div className="mb-2">
              <StarRating
                rating={rating}
                size="sm"
                filledColor="text-primary fill-primary"
                emptyColor="text-muted fill-muted"
              />
            </div>

            {/* Giá và các nút hành động */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">{price}</span>

              {variant === "default" && (
                <div className="flex items-center gap-2">
                  {/* Nút thêm nhanh vào giỏ */}
                  {onAddToCart && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-full border-primary/30 text-primary hover:bg-primary/10"
                      onClick={handleAddToCart}
                      aria-label={t('add_to_cart_aria', { title })}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  )}
                  {/* Nút Xem chi tiết */}
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white shadow-none rounded-full px-6 h-9 font-medium"
                    onClick={handleDetailsClick}
                  >
                    {t('details', {}, "Details")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
