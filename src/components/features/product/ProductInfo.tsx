"use client";

/**
 * Thành phần Thông tin Sản phẩm (Product Info Component)
 * 
 * Nằm ở nửa bên phải của trang chi tiết sản phẩm, hiển thị tên, giá,
 * đánh giá, số lượng đã bán/xem, các tùy chọn phân loại (Màu sắc, Số lượng)
 * và các nút thao tác như Thêm vào giỏ hàng (Buy Now), Yêu thích, Chia sẻ.
 */
import { Heart, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/ui/price-display";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { StarRating } from "@/components/ui/star-rating";
import { useLanguage } from "@/providers/language.provider";
import { formatNumber } from "@/utils/format";

// ===========================================
// Types
// ===========================================

interface ProductInfoProps {
  /** Tên sản phẩm */
  title: string;
  /** Mã SKU (Mã lưu kho) */
  sku: string;
  /** Giá bán hiện tại */
  price: number;
  /** Giá niêm yết (Giá ban đầu) */
  originalPrice?: number;
  /** Điểm đánh giá trung bình (Ví dụ: 4.5) */
  rating: number;
  /** Tổng số lượt đánh giá */
  reviewCount: number;
  /** Số lượng đã bán */
  soldCount: number;
  /** Số lượt xem sản phẩm */
  viewCount: number;
  /** Đoạn mô tả ngắn (Tùy chọn) */
  description?: string;
  /** Sự kiện khi nhấn Thêm vào giỏ hàng hoặc Mua ngay */
  onAddToCart?: (quantity: number) => void;
  /** Sự kiện khi nhấn Yêu thích */
  onAddToWishlist?: () => void;
}

// ===========================================
// Component
// ===========================================

export function ProductInfo({
  title,
  sku,
  price,
  originalPrice,
  rating,
  reviewCount,
  soldCount,
  viewCount,
  onAddToCart,
  onAddToWishlist,
}: ProductInfoProps) {
  const { t, locale } = useLanguage();
  const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  // Trạng thái lưu trữ số lượng muốn mua
  const [quantity, setQuantity] = useState(1);

  const handleBuyNow = () => {
    onAddToCart?.(quantity);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Tiêu đề và Đánh giá */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {title}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>SKU: {sku}</span>
          <div className="flex items-center gap-1">
            {/* Hiển thị số sao thực tế bằng Component StarRating */}
            <StarRating rating={rating} size="sm" />
            <span className="ml-1 text-gray-900">{t('reviews_count', { count: formatNumber(reviewCount, currentLocale) }, `(${reviewCount} reviews)`)}</span>
          </div>
        </div>
      </div>

      {/* 2. Giá */}
      <PriceDisplay
        price={price}
        originalPrice={originalPrice}
        size="lg"
        showDiscountPercent
      />

      {/* 3. Thống kê bán/xem */}
      <div className="flex gap-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {formatNumber(soldCount, currentLocale)}
          </span>
          {t('sold', {}, "Sold")}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {formatNumber(viewCount, currentLocale)}
          </span>
          {t('viewed', {}, "Viewed")}
        </div>
      </div>

      {/* 4. Các tùy chọn cho khách hàng (Số lượng, Màu sắc...) */}
      <div className="space-y-4 border-t border-b border-gray-100 py-6">
        {/* Số lượng */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">{t('quantity', {}, "Quantity")}</span>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
          />
        </div>

        {/* Màu sắc (Demo giao diện tĩnh) */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">{t('color', {}, "Color")}</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="h-6 w-6 rounded-full bg-black ring-2 ring-offset-1 ring-gray-300 cursor-pointer focus:outline-none focus:ring-primary"
              aria-label={t('select_color_black', {}, "Select black color")}
            />
            <button
              type="button"
              className="h-6 w-6 rounded-full bg-blue-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('select_color_blue', {}, "Select blue color")}
            />
            <button
              type="button"
              className="h-6 w-6 rounded-full bg-white border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('select_color_white', {}, "Select white color")}
            />
          </div>
        </div>
      </div>

      {/* 5. Các nút Thao tác chính */}
      <div className="flex gap-4">
        {/* Nút thanh toán/mua */}
        <Button
          className="flex-1 h-12 rounded-full text-base font-semibold"
          size="lg"
          onClick={handleBuyNow}
        >
          {t('buy_now', {}, "Buy Now")}
        </Button>
        {/* Nút thêm vào WL */}
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-gray-200"
          onClick={onAddToWishlist}
          aria-label={t('add_to_wishlist', {}, "Add to wishlist")}
        >
          <Heart className="h-5 w-5" />
        </Button>
        {/* Nút chia sẻ */}
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-gray-200"
          aria-label={t('share_product', {}, "Share product")}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
