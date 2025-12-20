"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-blue-50">
        {images[selectedIndex] ? (
          <Image
            src={images[selectedIndex]}
            alt="Product image"
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg bg-blue-50 transition-all hover:opacity-100",
              selectedIndex === index
                ? "ring-2 ring-primary ring-offset-2"
                : "opacity-70 hover:ring-2 hover:ring-primary/50 hover:ring-offset-1"
            )}
          >
            <Image
              src={image}
              alt={`Product thumbnail ${index + 1}`}
              fill
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
