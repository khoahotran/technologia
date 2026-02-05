"use client";

import { Heart, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/ui/price-display";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { StarRating } from "@/components/ui/star-rating";
import { formatNumber } from "@/shared/utils/format";

// ===========================================
// Types
// ===========================================

interface ProductInfoProps {
  title: string;
  sku: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  description?: string;
  onAddToCart?: (quantity: number) => void;
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
  const [quantity, setQuantity] = useState(1);

  const handleBuyNow = () => {
    onAddToCart?.(quantity);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title and Rating */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {title}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>SKU: {sku}</span>
          <div className="flex items-center gap-1">
            <StarRating rating={rating} size="sm" />
            <span className="ml-1 text-gray-900">({reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <PriceDisplay
        price={price}
        originalPrice={originalPrice}
        size="lg"
        showDiscountPercent
      />

      {/* Stats */}
      <div className="flex gap-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {formatNumber(soldCount)}
          </span>
          Sold
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {formatNumber(viewCount)}
          </span>
          Viewed
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4 border-t border-b border-gray-100 py-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Quantity</span>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
          />
        </div>

        {/* Color Options */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Color</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="h-6 w-6 rounded-full bg-black ring-2 ring-offset-1 ring-gray-300 cursor-pointer focus:outline-none focus:ring-primary"
              aria-label="Select black color"
            />
            <button
              type="button"
              className="h-6 w-6 rounded-full bg-blue-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Select blue color"
            />
            <button
              type="button"
              className="h-6 w-6 rounded-full bg-white border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Select white color"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          className="flex-1 h-12 rounded-full text-base font-semibold"
          size="lg"
          onClick={handleBuyNow}
        >
          Buy now
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-gray-200"
          onClick={onAddToWishlist}
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-gray-200"
          aria-label="Share product"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
