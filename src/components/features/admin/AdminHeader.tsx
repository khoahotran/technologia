"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/providers/language.provider";
import { cn } from "@/utils/cn";

export function AdminHeader() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const adminTabs = [
        { href: "/admin/home", label: t("admin_nav_home_management", {}, "HOME MANAGEMENT") },
        { href: "/admin/products", label: t("admin_nav_product_management", {}, "PRODUCT MANAGEMENT") },
        { href: "/admin/orders", label: t("admin_nav_order_management", {}, "ORDER MANAGEMENT") },
        { href: "/admin/reports", label: t("admin_nav_reporting_management", {}, "REPORTING MANAGEMENT") },
    ];

    return (
        <header className="w-full">
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 pt-6 pb-3">
                    <nav className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
                        {adminTabs.map((tab) => (
                            <Link key={tab.href} href={tab.href}
                                className={cn("py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors rounded-xl",
                                    pathname === tab.href && "text-primary bg-accent")}>
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
