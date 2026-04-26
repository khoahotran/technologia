"use client";

import { ChevronDown, Mail, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/providers/language.provider";
import { cn } from "@/utils/cn";

export function AdminHeader() {
    const pathname = usePathname();
    const { t, locale, setLocale } = useLanguage();
    const adminTabs = [
        { href: "/admin/home", label: t("admin_nav_home_management", {}, "HOME MANAGEMENT") },
        { href: "/admin/products", label: t("admin_nav_product_management", {}, "PRODUCT MANAGEMENT") },
        { href: "/admin/orders", label: t("admin_nav_order_management", {}, "ORDER MANAGEMENT") },
        { href: "/admin/reports", label: t("admin_nav_reporting_management", {}, "REPORTING MANAGEMENT") },
    ];

    return (
        <header className="w-full">
            <div className="bg-[#3E93B3] text-[#E8F3F8] text-sm">
                <div className="container mx-auto px-4 h-[72px] flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>(+84)123456789</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>mystore@gmail.com</span>
                        </div>
                        <div className="hidden lg:flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{t("admin_location_label", {}, "mylocation")}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
                        className="flex items-center gap-1 font-medium uppercase"
                    >
                        <span>{locale.toUpperCase()}</span>
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div className="bg-[#F2F3FA] border-b border-black">
                <div className="container mx-auto px-4 pt-8 pb-4">
                    <div className="flex justify-end mb-6">
                        <button
                            type="button"
                            className="h-14 px-7 rounded-2xl bg-[#8AB0C3] text-white inline-flex items-center gap-3 font-semibold"
                        >
                            <User className="h-5 w-5" />
                            <span>{t("admin_account", {}, "Your Account")}</span>
                        </button>
                    </div>

                    <nav className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
                        {adminTabs.map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "py-2 text-sm md:text-base lg:text-2xl font-semibold text-[#1E1E1E] hover:text-[#0D6E97] transition-colors",
                                    pathname === tab.href && "text-[#0D6E97]"
                                )}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
