/**
 * Thành phần Chân trang (Footer Feature Component)
 * 
 * Hiển thị thông tin tổng hợp ở cuối mọi trang của ứng dụng, bao gồm:
 * - Liên kết mạng xã hội (Facebook, Youtube, Instagram, LinkedIn).
 * - Các liên kết nhanh (Quick Links).
 * - Khu vực hỗ trợ khách hàng (Customer Area).
 * - Thông tin liên hệ và tải ứng dụng.
 */
import { Facebook, Youtube, Instagram, Linkedin, Headphones } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Cột 1: Thương hiệu & Mạng xã hội */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm max-w-xs">
                Luôn kết nối với cộng đồng công nghệ của chúng tôi
              </p>
              <div className="flex space-x-3">
                <Button variant="secondary" size="icon" className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                  <Youtube className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Liên kết nhanh</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-600 hover:text-primary transition-colors text-sm">Về chúng tôi</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-primary transition-colors text-sm">Liên hệ</Link></li>
              <li><Link href="/products" className="text-gray-600 hover:text-primary transition-colors text-sm">Sản phẩm</Link></li>
              <li><Link href="/login" className="text-gray-600 hover:text-primary transition-colors text-sm">Đăng nhập</Link></li>
              <li><Link href="/signup" className="text-gray-600 hover:text-primary transition-colors text-sm">Đăng ký</Link></li>
            </ul>
          </div>

          {/* Cột 3: Khu vực Khách hàng */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Chăm sóc khách hàng</h3>
            <ul className="space-y-4">
              <li><Link href="/account" className="text-gray-600 hover:text-primary transition-colors text-sm">Tài khoản của tôi</Link></li>
              <li><Link href="/orders" className="text-gray-600 hover:text-primary transition-colors text-sm">Đơn hàng</Link></li>
              <li><Link href="/cart" className="text-gray-600 hover:text-primary transition-colors text-sm">Giỏ hàng</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-primary transition-colors text-sm">Điều khoản sử dụng</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors text-sm">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Liên hệ</h3>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Chúng tôi luôn lắng nghe ý kiến của bạn!</p>

              <div className="flex items-center space-x-3 py-2">
                <Headphones className="h-8 w-8 text-gray-800" />
                <div>
                  <p className="text-xs text-gray-500">Bạn có câu hỏi?</p>
                  <p className="font-bold text-blue-900">(+84) 123 456 789</p>
                </div>
              </div>

              {/* Tải ứng dụng */}
              <div className="flex space-x-4 pt-2">
                <div className="border rounded-md px-3 py-1.5 flex items-center space-x-2 cursor-pointer hover:bg-gray-50">
                  <div className="text-xs">
                    <p className="text-[10px] leading-none text-gray-500">Tải về trên</p>
                    <p className="font-semibold leading-tight text-gray-800">Google Play</p>
                  </div>
                </div>
                <div className="border rounded-md px-3 py-1.5 flex items-center space-x-2 cursor-pointer hover:bg-gray-50">
                  <div className="text-xs">
                    <p className="text-[10px] leading-none text-gray-500">Tải về trên</p>
                    <p className="font-semibold leading-tight text-gray-800">Amazon.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
