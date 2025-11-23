"use client"

import { Laptop, Smartphone, Tablet, Watch, Headphones, Speaker, MoreHorizontal, Flame, Trophy, Music } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  isActive?: boolean
}

export function ProductSidebar() {
  const categories: Category[] = [
    { id: "laptop", name: "Laptop", icon: <Laptop className="h-5 w-5" />, isActive: true },
    { id: "phone", name: "Phone", icon: <Smartphone className="h-5 w-5" /> },
    { id: "tablet", name: "Tablet", icon: <Tablet className="h-5 w-5" /> },
    { id: "accessories", name: "Accessories", icon: <Headphones className="h-5 w-5" /> },
    { id: "smartwatch", name: "Smart Watch", icon: <Watch className="h-5 w-5" /> },
    { id: "phonehead", name: "Phonehead", icon: <Headphones className="h-5 w-5" /> },
    { id: "others", name: "Others", icon: <MoreHorizontal className="h-5 w-5" /> },
  ]

  const specialSections = [
    { id: "hot", name: "Hot sales", icon: <Flame className="h-5 w-5" />, color: "bg-blue-100 text-blue-700" },
    { id: "best", name: "Best Seller", icon: <Trophy className="h-5 w-5" />, color: "bg-blue-100 text-blue-700" },
  ]

  const bottomSections = [
    { id: "hot-bottom", name: "Hot", icon: <Laptop className="h-5 w-5" />, color: "bg-blue-100" },
    { id: "sale", name: "Sale", icon: <Trophy className="h-5 w-5" />, color: "bg-pink-50" },
    { id: "new", name: "New", icon: <Music className="h-5 w-5" />, color: "bg-gray-50" },
  ]

  return (
    <div className="space-y-8 w-full md:w-64 shrink-0">
      {/* Special Sections */}
      <div className="space-y-2">
        {specialSections.map((section) => (
          <div
            key={section.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors cursor-pointer",
              section.color
            )}
          >
            {section.icon}
            <span>{section.name}</span>
          </div>
        ))}
      </div>

      {/* Categories */}
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

      {/* Bottom Sections */}
      <div className="space-y-2">
        {bottomSections.map((section) => (
          <div
            key={section.id}
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-3 font-medium transition-colors cursor-pointer",
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
