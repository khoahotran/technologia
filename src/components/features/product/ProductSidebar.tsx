"use client"

/**
 * Thành phần Thanh bên Danh mục (Product Sidebar Component)
 * 
 * Hiển thị cột bên trái của trang danh sách sản phẩm, chứa các mục điều hướng
 * theo danh mục thiết bị (Laptop, Điện thoại, Phụ kiện), và các khu vực đặc biệt
 * (Bán chạy, Khuyến mãi...).
 */
import { Laptop, Smartphone, Tablet, Watch, Headphones, MoreHorizontal, Flame, Trophy, Music } from "lucide-react"

import { cn } from "@/utils/cn"

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  isActive?: boolean
}

export function ProductSidebar() {
  /** Danh sách các danh mục chính */
  const categories: Category[] = [
    { id: "laptop", name: "Máy tính xách tay", icon: <Laptop className="h-5 w-5" />, isActive: true },
    { id: "phone", name: "Điện thoại", icon: <Smartphone className="h-5 w-5" /> },
    { id: "tablet", name: "Máy tính bảng", icon: <Tablet className="h-5 w-5" /> },
    { id: "accessories", name: "Phụ kiện", icon: <Headphones className="h-5 w-5" /> },
    { id: "smartwatch", name: "Đồng hồ thông minh", icon: <Watch className="h-5 w-5" /> },
    { id: "phonehead", name: "Tai nghe", icon: <Headphones className="h-5 w-5" /> },
    { id: "others", name: "Khác", icon: <MoreHorizontal className="h-5 w-5" /> },
  ]

  /** Danh sách các mục đặc biệt ở trên cùng */
  const specialSections = [
    { id: "hot", name: "Khuyến mãi Hot", icon: <Flame className="h-5 w-5" />, color: "bg-blue-100 text-blue-700" },
    { id: "best", name: "Bán chạy nhất", icon: <Trophy className="h-5 w-5" />, color: "bg-blue-100 text-blue-700" },
  ]

  /** Danh sách các mục tĩnh ở dưới cùng */
  const bottomSections = [
    { id: "hot-bottom", name: "Hot", icon: <Laptop className="h-5 w-5" />, color: "bg-blue-100" },
    { id: "sale", name: "Sale", icon: <Trophy className="h-5 w-5" />, color: "bg-pink-50" },
    { id: "new", name: "Mới", icon: <Music className="h-5 w-5" />, color: "bg-gray-50" },
  ]

  return (
    <div className="space-y-8 w-full md:w-64 shrink-0">
      {/* Khối Đặc biệt (Khuyến mãi/Bán chạy) */}
      <div className="space-y-2">
        {specialSections.map((section) => (
          <div
            key={section.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors cursor-pointer hover:opacity-80",
              section.color
            )}
          >
            {section.icon}
            <span>{section.name}</span>
          </div>
        ))}
      </div>

      {/* Khối Danh mục chính */}
      <div className="space-y-2 bg-orange-50/50 p-4 rounded-2xl">
        {categories.map((category) => (
          <div
            key={category.id}
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-3 font-medium transition-colors cursor-pointer hover:bg-white hover:shadow-sm",
              category.isActive ? "bg-blue-100 text-gray-900" : "bg-white text-gray-700"
            )}
          >
            <span>{category.name}</span>
            {category.icon}
          </div>
        ))}
      </div>

      {/* Khối Mục ở dưới cùng */}
      <div className="space-y-2">
        {bottomSections.map((section) => (
          <div
            key={section.id}
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-3 font-medium transition-colors cursor-pointer hover:opacity-80",
              section.color
            )}
          >
            <span>{section.name}</span>
            {section.icon}
          </div>
        ))}
      </div>
    </div>
  )
}
