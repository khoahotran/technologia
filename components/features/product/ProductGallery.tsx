"use client"

/**
 * Thành phần Bộ Sưu tập Hình ảnh Sản phẩm (Product Gallery Component)
 * 
 * Hiển thị một hình ảnh chính kích thước lớn và danh sách các hình ảnh thu nhỏ
 * (thumbnails) bên dưới để người dùng có thể nhấp vào và xem.
 */
import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  /** Mảng chứa các đường dẫn hình ảnh của sản phẩm */
  images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  // Trạng thái lưu trữ chỉ số của hình ảnh đang được chọn hiển thị lớn
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Hình Ảnh Chính (Lớn) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-blue-50">
        {images[selectedIndex] ? (
          <Image
            src={images[selectedIndex]}
            alt="Product image"
            fill
            className="object-cover object-center"
            priority /* Ưu tiên tải hình ảnh chính này trước tiên để tránh nháy Layout */
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            Không có hình ảnh
          </div>
        )}
      </div>

      {/* Danh sách Hình Thu nhỏ (Thumbnails) */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg bg-blue-50 transition-all hover:opacity-100",
              // Thêm viền khi thumbnail được chọn
              selectedIndex === index
                ? "ring-2 ring-primary ring-offset-2"
                : "opacity-70 hover:ring-2 hover:ring-primary/50 hover:ring-offset-1"
            )}
          >
            <Image
              src={image}
              alt={`Hình thu nhỏ sản phẩm ${index + 1}`}
              fill
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
