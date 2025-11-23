"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, ChevronDown, Search, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HeaderProps {
  variant?: "simple" | "with-categories"
}

export default function Header({ variant = "simple" }: HeaderProps) {
  return (
    <header className="w-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-xs md:text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>(+84)123456789</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>mystore@gmail.com</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>mylocation</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
            <ChevronDown className="h-4 w-4" />
            <span className="font-medium">VI</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="bg-white py-6 border-b border-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo Area (Empty in design but implied structure) */}
          <div className="hidden md:block w-1/6"></div>

          {/* Search */}
          <div className="flex-1 w-full max-w-2xl relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search here" 
                className="w-full pl-10 bg-gray-100 border-transparent focus-visible:bg-white focus-visible:ring-primary rounded-full h-11" 
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 w-auto md:w-1/6 justify-end">
            <div className="relative cursor-pointer">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600">
                4
              </Badge>
            </div>
            
            <Button variant="secondary" className="rounded-lg gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium">
              <User className="h-5 w-5" />
              Your Account
            </Button>
          </div>
        </div>
      </div>

      {/* Category Bar (Conditional) */}
      {variant === "with-categories" && (
        <div className="bg-white py-4 border-b border-gray-100 hidden md:block">
          <div className="container mx-auto px-4">
            <ul className="flex items-center justify-between text-sm font-medium text-gray-600">
              <li><Link href="/categories" className="text-gray-900 hover:text-primary transition-colors">All categories</Link></li>
              <li><Link href="/smartphone" className="hover:text-primary transition-colors">Smartphone</Link></li>
              <li><Link href="/laptop" className="hover:text-primary transition-colors">Laptop</Link></li>
              <li><Link href="/gaming" className="hover:text-primary transition-colors">Gaming Equipment</Link></li>
              <li><Link href="/headphone" className="hover:text-primary transition-colors">Headphone</Link></li>
              <li><Link href="/speaker" className="hover:text-primary transition-colors">Speaker</Link></li>
              <li><Link href="/others" className="hover:text-primary transition-colors">Others</Link></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}
