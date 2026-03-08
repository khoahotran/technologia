"use client"

/**
 * Thành phần Đầu trang (Header Feature Component)
 * 
 * Đây là Header chính của toàn bộ ứng dụng, bao gồm:
 * - Thanh Top Bar: Thông tin liên hệ, ngôn ngữ, giới thiệu.
 * - Thanh Main Bar: Logo, Ô tìm kiếm và các hành động (Giỏ hàng, Tài khoản).
 * - Tích hợp logic Xác thực (Auth) để hiển thị trạng thái đăng nhập.
 */
import { Phone, Mail, ChevronDown, Search, ShoppingCart, User, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/presentation/hooks/use-auth"
import { useLanguage } from "@/shared/providers/language.provider";

interface HeaderProps {
  /** 
   * Biến thể hiển thị Header 
   * - default: Đầy đủ tính năng.
   * - minimal: Tối giản (ko tìm kiếm/thanh top), dùng cho trang Checkout hoặc Login.
   */
  variant?: "default" | "minimal"
}

/**
 * Thành phần Nút tài khoản (Account Button)
 * 
 * Thành phần con xử lý logic hiển thị dựa trên trạng thái đăng nhập:
 * - Chưa đăng nhập: Hiển thị liên kết trang Login.
 * - Đã đăng nhập: Hiển thị Username và Menu thả xuống (Dropdown) chứa thông tin cá nhân và Logout.
 */
function AccountButton() {
  const { t } = useLanguage();
  const { token, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!token) {
    return (
      <Link href="/login">
        <Button variant="ghost" className="rounded-full h-10 w-10 p-0 md:w-auto md:px-4 md:bg-gray-50 md:hover:bg-gray-100 gap-2">
          <User className="h-5 w-5" />
          <span className="hidden md:inline">{t('header_account', {}, "Account")}</span>
        </Button>
      </Link>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="rounded-full h-10 w-10 p-0 md:w-auto md:px-4 md:bg-gray-50 md:hover:bg-gray-100 gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="h-5 w-5" />
        <span className="hidden md:inline">{user?.username || t('header_account', {}, "Account")}</span>
      </Button>

      {/* Dropdown Menu khi người dùng nhấn vào nút Account */}
      {isOpen && (
        <>
          {/* Lớp nền mờ để đóng menu khi click ra ngoài */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-2 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.username || t('header_user', {}, "User")}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "Member"}
              </p>
            </div>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <span className="font-medium">{t('header_logout', {}, "Logout")}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Thành phần Ô tìm kiếm (Search Box)
 * 
 * Cho phép tìm kiếm sản phẩm theo tên. 
 * Kết quả tìm kiếm sẽ được đẩy lên URL query parameter (?name=...) của trang /products.
 */
function SearchBox() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("name") || "");

  /** Thực hiện lệnh tìm kiếm */
  const handleSearch = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (term.trim()) {
      current.set("name", term.trim());
    } else {
      current.delete("name");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/products${query}`);
  };

  /** Hỗ trợ tìm kiếm khi nhấn Enter */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
      <Input
        placeholder={t('header_search_placeholder', {}, "Search for products, brands...")}
        className="w-full pl-10 bg-gray-50 border-gray-200 focus-visible:bg-white focus-visible:ring-primary rounded-full h-11 transition-all"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        className="absolute right-1 top-1 rounded-full h-9 px-4"
        onClick={handleSearch}
      >
        {t('header_search_btn', {}, "Search")}
      </Button>
    </div>
  );
}

/**
 * Thành phần chính Header
 */
export default function Header({ variant = "default" }: HeaderProps) {
  const { t, locale, setLocale } = useLanguage();
  return (
    <header className="w-full flex flex-col bg-white sticky top-0 z-40 shadow-sm">
      {/* 1. Thanh Top Bar (Thông tin phụ) - Chỉ hiện ở variant default */}
      {variant === "default" && (
        <div className="bg-primary text-primary-foreground py-2 text-xs md:text-sm transition-colors">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(+84) 123 456 789</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@techstore.com</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:underline">{t('header_about_us', {}, "About Us")}</Link>
              <div
                className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
              >
                <span className="font-medium uppercase">{locale}</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Thanh Main Bar (Khu vực chính) */}
      <div className="py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Vùng Logo */}
          <Link href="/" className="md:w-1/6 flex items-center gap-2 group">
            <div className="bg-primary text-white p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">TechStore</span>
          </Link>

          {variant === "default" && (
            <>
              {/* Vùng Ô tìm kiếm */}
              <div className="flex-1 w-full max-w-2xl px-4">
                <SearchBox />
              </div>

              {/* Vùng Hành động (Giỏ hàng & Tài khoản) */}
              <div className="flex items-center gap-6 w-auto md:w-1/6 justify-end">
                <Link href="/cart" className="relative cursor-pointer group">
                  <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                </Link>

                {/* Nút đăng nhập/tài khoản */}
                <AccountButton />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
