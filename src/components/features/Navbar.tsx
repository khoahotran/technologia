"use client";

/**
 * Thành phần Thanh điều hướng (Navbar Feature Component)
 * 
 * Một thanh điều hướng đơn giản, chủ yếu dùng để chuyển hướng nhanh giữa các trang chính.
 * Tự động thay đổi các liên kết dựa trên trạng thái đăng nhập và quyền (Role) của người dùng.
 */
import Link from "next/link";

import { useAuth } from "@/features/auth/hooks";
import { useLanguage } from "@/providers/language.provider";

export default function Navbar() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <nav className="flex gap-4 p-4 border-b">
      <Link href="/" className="hover:text-primary transition-colors">{t('navbar_home', {}, "Home")}</Link>
      <Link href="/products" className="hover:text-primary transition-colors">{t('navbar_products', {}, "Products")}</Link>

      {/* Chỉ hiển thị Giỏ hàng nếu người dùng đã đăng nhập */}
      {user && <Link href="/cart" className="hover:text-primary transition-colors">{t('navbar_cart', {}, "Cart")}</Link>}

      {/* Chỉ hiển thị Dashboard nếu người dùng có vai trò là quản trị viên */}
      {user?.role === "admin" && (
        <Link href="/admin" className="hover:text-primary transition-colors font-semibold">{t('navbar_admin', {}, "Admin Panel")}</Link>
      )}

      {/* Hiển thị nút Đăng nhập nếu chưa có người dùng */}
      {!user && <Link href="/login" className="hover:text-primary transition-colors">{t('navbar_login', {}, "Login")}</Link>}
    </nav>
  );
}
