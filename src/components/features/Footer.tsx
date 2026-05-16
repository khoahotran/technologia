"use client";

/**
 * Thành phần Chân trang (Footer Feature Component)
 * 
 * Hiển thị thông tin tổng hợp ở cuối mọi trang của ứng dụng, bao gồm:
 * - Liên kết mạng xã hội (Facebook, Youtube, Instagram, LinkedIn).
 * - Các liên kết nhanh (Quick Links).
 * - Khu vực hỗ trợ khách hàng (Customer Area).
 * - Thông tin liên hệ và tải ứng dụng.
 */
import { Facebook, Headphones, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CONTACT_INFO } from "@/constants/contact";
import { useLanguage } from "@/providers/language.provider";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Cột 1: Thương hiệu & Mạng xã hội */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm max-w-xs">
                {t('footer_stay_connected', {}, "Stay connected with our tech community")}
              </p>
              <div className="flex space-x-3">
                <a href={CONTACT_INFO.socials.facebook} target="_blank" rel="noopener noreferrer">
                  <Button aria-label="Facebook" variant="secondary" size="icon" className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                    <Facebook className="h-5 w-5" />
                  </Button>
                </a>
                <a href={CONTACT_INFO.socials.youtube} target="_blank" rel="noopener noreferrer">
                  <Button aria-label="YouTube" variant="secondary" size="icon" className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                    <Youtube className="h-5 w-5" />
                  </Button>
                </a>
                <a href={CONTACT_INFO.socials.instagram} target="_blank" rel="noopener noreferrer">
                  <Button aria-label="Instagram" variant="secondary" size="icon" className="rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100">
                    <Instagram className="h-5 w-5" />
                  </Button>
                </a>
                <a href={CONTACT_INFO.socials.linkedin} target="_blank" rel="noopener noreferrer">
                  <Button aria-label="LinkedIn" variant="secondary" size="icon" className="rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
                    <Linkedin className="h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">{t('footer_quick_links', {}, "Quick Links")}</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_about_us', {}, "About Us")}</Link></li>
              <li><Link href="/about#contact" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_contact_us', {}, "Contact")}</Link></li>
              <li><Link href="/products" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_products', {}, "Products")}</Link></li>
              <li><Link href="/login" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_login', {}, "Login")}</Link></li>
              <li><Link href="/signup" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_signup', {}, "Sign Up")}</Link></li>
            </ul>
          </div>

          {/* Cột 3: Khu vực Khách hàng */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">{t('footer_customer_service', {}, "Customer Service")}</h3>
            <ul className="space-y-4">
              <li><Link href="/profile" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_my_account', {}, "My Account")}</Link></li>
              <li><Link href="/orders" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_orders', {}, "Orders")}</Link></li>
              <li><Link href="/cart" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_cart', {}, "Cart")}</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_terms', {}, "Terms of Use")}</Link></li>
              <li><Link href="/policy" className="text-gray-600 hover:text-primary transition-colors text-sm">{t('footer_policy', {}, "Purchase Policy")}</Link></li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">{t('footer_contact_info', {}, "Contact Info")}</h3>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">{t('footer_listening', {}, "We're always listening to your feedback!")}</p>

              <div className="flex items-center space-x-3 py-2">
                <Headphones className="h-8 w-8 text-gray-800" />
                <a href={`tel:${CONTACT_INFO.phone.value}`}>
                  <div>
                    <p className="text-xs text-gray-500">{t('footer_questions', {}, "Have questions?")}</p>
                    <p className="font-bold text-blue-900">{CONTACT_INFO.phone.display}</p>
                  </div>
                </a>
              </div>

              {/* Tải ứng dụng */}
              {/* <div className="flex space-x-4 pt-2">
                <div className="border rounded-md px-3 py-1.5 flex items-center space-x-2 cursor-pointer hover:bg-gray-50">
                  <div className="text-xs">
                    <p className="text-tiny leading-none text-gray-500">{t('footer_download_on', {}, "Download on")}</p>
                    <p className="font-semibold leading-tight text-gray-800">Google Play</p>
                  </div>
                </div>
                <div className="border rounded-md px-3 py-1.5 flex items-center space-x-2 cursor-pointer hover:bg-gray-50">
                  <div className="text-xs">
                    <p className="text-tiny leading-none text-gray-500">{t('footer_download_on', {}, "Download on")}</p>
                    <p className="font-semibold leading-tight text-gray-800">Amazon.com</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
