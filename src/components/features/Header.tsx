"use client"

/**
 * Thành phần Đầu trang (Header Feature Component)
 * 
 * Đây là Header chính của toàn bộ ứng dụng, bao gồm:
 * - Thanh Top Bar: Thông tin liên hệ, ngôn ngữ, giới thiệu.
 * - Thanh Main Bar: Logo, Ô tìm kiếm và các hành động (Giỏ hàng, Tài khoản).
 * - Tích hợp logic Xác thực (Auth) để hiển thị trạng thái đăng nhập.
 */
import { ChevronDown, Mail, Phone, Search, ShoppingBag, ShoppingCart, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CONTACT_INFO } from "@/constants/contact"
import { useAuth } from "@/features/auth/hooks"
import { useAuthStore } from "@/features/auth/store"
import { useCart } from "@/features/cart/hooks"
import { useLanguage } from "@/providers/language.provider"
import { cn } from "@/utils"

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
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch profile if email is missing (happens right after login)
  useEffect(() => {
    if (token && user && !user.email) {
      import("@/features/user/api").then(({ getProfile }) => {
        getProfile().then((profile) => {
          updateUser({
            email: profile.email,
            username: profile.username || user.username
          });
        }).catch(err => console.error("Failed to fetch profile", err));
      });
    }
  }, [token, user, updateUser]);

  if (!token) {
    return (
      <Link href="/login" aria-label={t('header_login_aria', {}, "Go to login page")}>
        <Button variant="ghost" className="rounded-full h-10 w-10 p-0 md:w-auto md:px-4 md:bg-gray-50 md:hover:bg-gray-100 gap-2" aria-label={t('header_account_aria', {}, "User account menu")}>
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
        aria-label={t('header_account_aria', {}, "User account menu")}
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
                {user?.email || t('header_member', {}, "Member")}
              </p>
            </div>

            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className="font-medium">{t('header_profile', {}, "My Profile")}</span>
              </Link>

              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className="font-medium">{t('header_my_orders', {}, "My Orders")}</span>
              </Link>

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin/home"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 border-t border-gray-50 mt-1"
                >
                  <span className="font-bold">{t('header_admin_dashboard', {}, "Admin Dashboard")}</span>
                </Link>
              )}
            </div>

            <div className="border-t border-gray-50 pt-1">
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
        className="w-full pl-10 pr-24 sm:pr-28 bg-gray-50 border-gray-200 focus-visible:bg-white focus-visible:ring-primary rounded-full h-11 transition-all"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        className="absolute right-1 top-1 rounded-full h-9 px-3 sm:px-4"
        onClick={handleSearch}
        aria-label={t('header_search_aria', {}, "Search")}
      >
        <span className="hidden sm:inline">{t('header_search_btn', {}, "Search")}</span>
        <Search className="h-4 w-4 sm:hidden" />
      </Button>
    </div>
  );
}

/**
 * Thành phần chính Header
 */
export default function Header({ variant = "default" }: HeaderProps) {
  const { t, locale, setLocale } = useLanguage();
  const { user } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect Admin to /admin/home if they land on /
  useEffect(() => {
    if (user?.role === "ADMIN" && (pathname === "/" || pathname === "/vi" || pathname === "/en")) {
      router.push("/admin/home");
    }
  }, [user, pathname, router]);

  return (
    <header className="w-full flex flex-col bg-white sticky top-0 z-50 shadow-sm">
      {/* 1. Thanh Top Bar (Thông tin phụ) - Chỉ hiện ở variant default */}
      {variant === "default" && (
        <div className="bg-primary text-slate-900 py-1 text-xs md:text-sm transition-colors font-medium">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <a
                href={`tel:${CONTACT_INFO.phone.value}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Call support"
              >
                <Phone className="h-4 w-4" />
                <span>{CONTACT_INFO.phone.display}</span>
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Email support"
              >
                <Mail className="h-4 w-4" />
                <span>{CONTACT_INFO.email}</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/about"
                className="px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                {t('header_about_us', {}, "About Us")}
              </Link>

              <div className="relative group">
                <button className="h-8 flex items-center gap-1 px-2 uppercase font-semibold hover:bg-black/5 rounded-lg transition-colors text-sm">
                  {locale} <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
                <div className="absolute right-0 mt-1 w-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => setLocale('vi')}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors",
                      locale === 'vi' ? "font-bold text-primary" : "text-gray-600"
                    )}
                  >
                    VN
                  </button>
                  <button
                    onClick={() => setLocale('en')}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors",
                      locale === 'en' ? "font-bold text-primary" : "text-gray-600"
                    )}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Thanh Main Bar (Khu vực chính) */}
      <div className="py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-4 gap-x-2 md:gap-6">
          {/* Vùng Logo */}
          <Link href="/" className="flex-none flex items-center gap-2 group order-1">
            <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg bg-white p-1 shadow-xs border border-gray-100 flex items-center justify-center">
              <Image
                src="/favicon.webp"
                alt="Technologia Logo"
                width={32}
                height={32}
                className="object-contain transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Technologia</span>
          </Link>

          {variant === "default" && (
            <>
              {/* Vùng Ô tìm kiếm */}
              <div className="w-full md:w-auto md:flex-1 max-w-2xl order-3 md:order-2">
                <Suspense fallback={<div className="h-11 w-full bg-gray-50 rounded-full animate-pulse" />}>
                  <SearchBox />
                </Suspense>
              </div>

              {/* Vùng Hành động (Giỏ hàng & Tài khoản) */}
              <div className="flex-none flex items-center gap-4 md:gap-6 justify-end order-2 md:order-3">
                <Link href="/cart" className="relative cursor-pointer group shrink-0" aria-label={t('header_cart_aria', {}, "Open shopping cart")}>
                  <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                  {(cart?.totalItems ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-tiny font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 leading-none shadow-sm">
                      {cart!.totalItems! > 99 ? "99+" : cart!.totalItems}
                    </span>
                  )}
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
