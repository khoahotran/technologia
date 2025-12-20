"use client"

import { Star, Share2, Heart } from "lucide-react"
import { useState } from "react"

import { QuantitySelector } from "./QuantitySelector"

import { Button } from "@/components/ui/button"

interface ProductInfoProps {
  title: string
  sku: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  soldCount: number
  viewCount: number
  description?: string
}

export function ProductInfo({
  title,
  sku,
  price,
  originalPrice,
  rating,
  reviewCount,
  soldCount,
  viewCount,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>SKU: {sku}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
            <span className="ml-1 text-gray-900">({reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-4">
        <span className="text-3xl font-bold text-gray-900">
          {new Intl.NumberFormat("vi-VN").format(price)}
        </span>
        {originalPrice && (
          <span className="mb-1 text-lg text-gray-400 line-through">
            {new Intl.NumberFormat("vi-VN").format(originalPrice)}
          </span>
        )}
      </div>

      <div className="flex gap-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
           <span className="font-medium text-gray-900">{new Intl.NumberFormat("vi-VN").format(soldCount)}</span> Sold
        </div>
        <div className="flex items-center gap-2">
           <span className="font-medium text-gray-900">{new Intl.NumberFormat("vi-VN").format(viewCount)}</span> Viewed
        </div>
      </div>

      <div className="space-y-4 border-t border-b border-gray-100 py-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Quantity</span>
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>
        
        {/* Mock Properties */}
        <div className="flex items-center justify-between">
           <span className="text-sm font-medium text-gray-900">Color</span>
           <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-black ring-2 ring-offset-1 ring-gray-300 cursor-pointer"></div>
              <div className="h-6 w-6 rounded-full bg-blue-500 cursor-pointer"></div>
              <div className="h-6 w-6 rounded-full bg-white border border-gray-300 cursor-pointer"></div>
           </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button className="flex-1 h-12 rounded-full text-base font-semibold" size="lg">
          Buy now
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-gray-200">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-gray-200">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
