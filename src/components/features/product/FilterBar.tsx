"use client"

/**
 * Thành phần Thanh Bộ lọc (Filter Bar Component)
 * 
 * Cho phép người dùng trực tiếp thay đổi URL query parameters (?minPrice=...&sort=...)
 * để lọc và sắp xếp danh sách sản phẩm. Cung cấp bộ lọc theo khoảng giá và tiêu chí sắp xếp.
 */
import { ArrowDownUp } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/providers/language.provider"

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  /** 
   * Hàm cập nhật URL params 
   * @param key Tên của filter (VD: "minPrice", "maxPrice")
   * @param value Giá trị filter tương ứng
   */
  const updateFilter = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    // Logic kiểm tra rốt khoảng giá (Min/Max) hợp lệ
    // Nếu chọn Min > Max hiện tại -> Xóa Max
    if (key === 'minPrice') {
      const currentMax = Number(current.get('maxPrice'));
      if (value && currentMax && Number(value) > currentMax) {
        current.delete('maxPrice');
      }
    }

    // Nếu chọn Max < Min hiện tại -> Xóa Min
    if (key === 'maxPrice') {
      const currentMin = Number(current.get('minPrice'));
      if (value && currentMin && Number(value) < currentMin) {
        current.delete('minPrice');
      }
    }

    if (!value) {
      current.delete(key)
    } else {
      current.set(key, value)
    }

    const search = current.toString()
    const query = search ? `?${search}` : ""

    router.push(`${pathname}${query}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-4 bg-blue-50/30 p-4 rounded-xl">
      {/* Bộ lọc Giá Tối thiểu */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">{t('filter_min_price', {}, "Giá thấp nhất")}</span>
        <Select
          defaultValue={searchParams.get("minPrice") || "0"}
          onValueChange={(val) => updateFilter("minPrice", val)}
        >
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder={t('select_price', {}, "Chọn giá")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0 VND</SelectItem>
            <SelectItem value="1000000">1.000.000 VND</SelectItem>
            <SelectItem value="2000000">2.000.000 VND</SelectItem>
            <SelectItem value="5000000">5.000.000 VND</SelectItem>
            <SelectItem value="10000000">10.000.000 VND</SelectItem>
            <SelectItem value="20000000">20.000.000 VND</SelectItem>
            <SelectItem value="50000000">50.000.000 VND</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bộ lọc Giá Tối đa */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">{t('filter_max_price', {}, "Giá cao nhất")}</span>
        <Select
          defaultValue={searchParams.get("maxPrice") || ""}
          onValueChange={(val) => updateFilter("maxPrice", val)}
        >
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder={t('select_price', {}, "Chọn giá")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1000000">1.000.000 VND</SelectItem>
            <SelectItem value="2000000">2.000.000 VND</SelectItem>
            <SelectItem value="5000000">5.000.000 VND</SelectItem>
            <SelectItem value="10000000">10.000.000 VND</SelectItem>
            <SelectItem value="20000000">20.000.000 VND</SelectItem>
            <SelectItem value="50000000">50.000.000 VND</SelectItem>
            <SelectItem value="100000000">100.000.000 VND</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sắp xếp danh sách */}
      <div className="flex flex-col gap-1.5 ml-auto">
        <span className="text-xs font-medium text-gray-500">{t('filter_order', {}, "Sắp xếp theo")}</span>
        <Select
          defaultValue={searchParams.get("sort") || "price_asc"}
          onValueChange={(val) => updateFilter("sort", val)}
        >
          <SelectTrigger className="w-[180px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder={t('select_sort', {}, "Sắp xếp")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_asc">{t('price_asc', {}, "Giá tăng dần")}</SelectItem>
            <SelectItem value="price_desc">{t('price_desc', {}, "Giá giảm dần")}</SelectItem>
            <SelectItem value="newest">{t('newest', {}, "Mới nhất")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
