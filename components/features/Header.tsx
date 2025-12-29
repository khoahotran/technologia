"use client"

import { Phone, Mail, ChevronDown, Search, ShoppingCart, User, ShoppingBag } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  variant?: "default" | "minimal"
}

import { useAuth } from "@/presentation/hooks/use-auth.hook";

// Helper component to handle auth logic
function AccountButton() {
  const { token } = useAuth();

  return (
    <Link href={token ? "/account" : "/login"}>
      <Button variant="ghost" className="rounded-full h-10 w-10 p-0 md:w-auto md:px-4 md:bg-gray-50 md:hover:bg-gray-100 gap-2">
        <User className="h-5 w-5" />
        <span className="hidden md:inline">Account</span>
      </Button>
    </Link>
  );
}

export default function Header({ variant = "default" }: HeaderProps) {
  return (
    <header className="w-full flex flex-col bg-white sticky top-0 z-40 shadow-sm">
      {/* Top Bar - Only for default */}
      {variant === "default" && (
        <div className="bg-primary text-primary-foreground py-2 text-xs md:text-sm transition-colors">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(+84)123456789</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@techstore.com</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:underline">About Us</Link>
              <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                <span className="font-medium">VI</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="md:w-1/6 flex items-center gap-2 group">
            <div className="bg-primary text-white p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">TechStore</span>
          </Link>

          {variant === "default" && (
            <>
              {/* Search */}
              <div className="flex-1 w-full max-w-2xl px-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search products, brands and categories..."
                    className="w-full pl-10 bg-gray-50 border-gray-200 focus-visible:bg-white focus-visible:ring-primary rounded-full h-11 transition-all"
                  />
                  <Button className="absolute right-1 top-1 rounded-full h-9 px-4">Search</Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 w-auto md:w-1/6 justify-end">
                <Link href="/cart" className="relative cursor-pointer group">
                  <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 animate-in zoom-in">
                    4
                  </Badge>
                </Link>

                {/* Account Button with Token Check */}
                <AccountButton />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Bar - Only for default */}
      {variant === "default" && (
        <div className="hidden md:block border-b border-gray-100">
          <div className="container mx-auto px-4">
            <nav>
              <ul className="flex items-center gap-8 text-sm font-medium text-gray-600">
                <li><Link href="/" className="py-4 inline-block hover:text-primary border-b-2 border-transparent hover:border-primary transition-all">Home</Link></li>
                <li><Link href="/products" className="py-4 inline-block hover:text-primary border-b-2 border-transparent hover:border-primary transition-all">All Products</Link></li>
                <li><Link href="/products?category=smartphone" className="py-4 inline-block hover:text-primary border-b-2 border-transparent hover:border-primary transition-all">Smartphones</Link></li>
                <li><Link href="/products?category=laptop" className="py-4 inline-block hover:text-primary border-b-2 border-transparent hover:border-primary transition-all">Laptops</Link></li>
                <li><Link href="/products?category=audio" className="py-4 inline-block hover:text-primary border-b-2 border-transparent hover:border-primary transition-all">Audio</Link></li>
                <li><Link href="/address-book" className="py-4 inline-block hover:text-primary border-b-2 border-transparent hover:border-primary transition-all">Addresses</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
