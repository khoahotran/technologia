"use client"

import { ArrowDownUp } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-blue-50/30 p-4 rounded-xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Max star</span>
        <Select defaultValue="5">
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder="Select stars" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 stars</SelectItem>
            <SelectItem value="4">4 stars & up</SelectItem>
            <SelectItem value="3">3 stars & up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Min star</span>
        <Select defaultValue="0">
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder="Select stars" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0 stars</SelectItem>
            <SelectItem value="1">1 star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Min price</span>
        <Select defaultValue="0">
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder="Select price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0 VND</SelectItem>
            <SelectItem value="100000">100.000 VND</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Max price</span>
        <Select defaultValue="100">
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <SelectValue placeholder="Select price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100">100.000 VND</SelectItem>
            <SelectItem value="1000">1.000.000 VND</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 ml-auto">
        <span className="text-xs font-medium text-gray-500">Order</span>
        <Select defaultValue="price_asc">
          <SelectTrigger className="w-[140px] bg-blue-100/50 border-none h-9 rounded-lg">
            <div className="flex items-center gap-2">
               <span>Price</span>
               <ArrowDownUp className="h-3 w-3" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
