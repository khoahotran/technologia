"use client"

import { ArrowDownUp } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/shared/providers/language.provider"


export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locales } = useLanguage()

  // Function to update URL params
  const updateFilter = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    // Validation logic for Min/Max Price
    if (key === 'minPrice') {
      const currentMax = Number(current.get('maxPrice'));
      if (value && currentMax && Number(value) > currentMax) {
        // If new Min > Max, clear Max
        current.delete('maxPrice');
      }
    }

    if (key === 'maxPrice') {
      const currentMin = Number(current.get('minPrice'));
      if (value && currentMin && Number(value) < currentMin) {
        // If new Max < Min, clear Min
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

  // Helper to translate with replacement
  const t = (key: string, replacements?: Record<string, string | number>) => {
    let text = (locales as Record<string, string>)?.[key] || key
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }

  return (
    <div className="flex flex-wrap items-center gap-4 bg-blue-50/30 p-4 rounded-xl">
      {/* Max Star */}
      {/* <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">{t('filter_max_star')}</span>
        <Select
          defaultValue={searchParams.get("maxStar") || "5"}
          onValueChange={(val) => updateFilter("maxStar", val)}
        >
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder={t('select_stars')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">{t('stars', { count: 5 })}</SelectItem>
            <SelectItem value="4">{t('stars_and_up', { count: 4 })}</SelectItem>
            <SelectItem value="3">{t('stars_and_up', { count: 3 })}</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      {/* Min Star */}
      {/* <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">{t('filter_min_star')}</span>
        <Select
          defaultValue={searchParams.get("minStar") || "0"}
          onValueChange={(val) => updateFilter("minStar", val)}
        >
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder={t('select_stars')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">{t('stars', { count: 0 })}</SelectItem>
            <SelectItem value="1">{t('stars', { count: 1 })}</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      {/* Min Price */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">{t('filter_min_price')}</span>
        <Select
          defaultValue={searchParams.get("minPrice") || "0"}
          onValueChange={(val) => updateFilter("minPrice", val)}
        >
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder={t('select_price')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">{t('price_vnd', { price: 0 })}</SelectItem>
            <SelectItem value="1000000">{t('price_vnd', { price: "1.000.000" })}</SelectItem>
            <SelectItem value="2000000">{t('price_vnd', { price: "2.000.000" })}</SelectItem>
            <SelectItem value="5000000">{t('price_vnd', { price: "5.000.000" })}</SelectItem>
            <SelectItem value="10000000">{t('price_vnd', { price: "10.000.000" })}</SelectItem>
            <SelectItem value="20000000">{t('price_vnd', { price: "20.000.000" })}</SelectItem>
            <SelectItem value="50000000">{t('price_vnd', { price: "50.000.000" })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Max Price */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">{t('filter_max_price')}</span>
        <Select
          defaultValue={searchParams.get("maxPrice") || ""}
          onValueChange={(val) => updateFilter("maxPrice", val)}
        >
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder={t('select_price')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1000000">{t('price_vnd', { price: "1.000.000" })}</SelectItem>
            <SelectItem value="2000000">{t('price_vnd', { price: "2.000.000" })}</SelectItem>
            <SelectItem value="5000000">{t('price_vnd', { price: "5.000.000" })}</SelectItem>
            <SelectItem value="10000000">{t('price_vnd', { price: "10.000.000" })}</SelectItem>
            <SelectItem value="20000000">{t('price_vnd', { price: "20.000.000" })}</SelectItem>
            <SelectItem value="50000000">{t('price_vnd', { price: "50.000.000" })}</SelectItem>
            <SelectItem value="100000000">{t('price_vnd', { price: "100.000.000" })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order */}
      <div className="flex flex-col gap-1.5 ml-auto">
        <span className="text-xs font-medium text-gray-500">{t('filter_order')}</span>
        <Select
          defaultValue={searchParams.get("sort") || "price_asc"}
          onValueChange={(val) => updateFilter("sort", val)}
        >
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <div className="flex items-center gap-2">
              <span>Price</span>
              <ArrowDownUp className="h-3 w-3" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_asc">{t('price_asc')}</SelectItem>
            <SelectItem value="price_desc">{t('price_desc')}</SelectItem>
            <SelectItem value="newest">{t('newest')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
