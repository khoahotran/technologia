"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { DeliveryStatus } from "@/features/orders/types";
import { useLanguage } from "@/providers/language.provider";
import { cn } from "@/utils/cn";

interface OrderCardItem {
    quantity: number;
    name: string;
}

interface OrderCardProps {
    orderId: string;
    items: OrderCardItem[];
    status: DeliveryStatus;
    className?: string;
}

function getStatusColor(status: DeliveryStatus) {
    if (status === "DELIVERED") return "bg-[#EB8435] text-white";
    return "bg-[#8AB0C3] text-white";
}

export function OrderCard({ orderId, items, status, className }: OrderCardProps) {
    const { t } = useLanguage();

    return (
        <div className={cn("bg-white rounded-lg border border-[#D3E4F4] overflow-hidden", className)}>
            <Link
                href={`/orders/${orderId}`}
                className={cn(
                    "px-4 py-2 text-sm font-semibold flex items-center justify-between hover:brightness-95 transition-colors",
                    getStatusColor(status)
                )}
            >
                <span>#{orderId}</span>
                <span className="text-xs text-white">{t("view_detail", {}, "View detail")}</span>
            </Link>

            <div className="p-4 space-y-2 min-h-[92px]">
                {items.slice(0, 2).map((item, index) => (
                    <div key={`${orderId}-${index}`} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-gray-600">{item.quantity}x</span>
                        <span className="truncate">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface OrderCategoryProps {
    title: string;
    icon: ReactNode;
    count?: number;
    orders: Array<{ orderId: string; items: OrderCardItem[]; status: DeliveryStatus }>;
}

export function OrderCategory({ title, icon, count, orders }: OrderCategoryProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-[110px] h-[110px] bg-[#EFF4F9] border border-[#8AB0C3] rounded-xl flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="text-[28px] font-semibold text-[#1E1E1E] leading-tight">{title}</h3>
                    {count !== undefined && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-sm text-[#556070]">{t("orders_label", {}, "Orders")}</span>
                            <span className="w-6 h-6 rounded-full bg-[#EB8435] text-white text-xs font-semibold flex items-center justify-center">
                                {count}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {orders.slice(0, 4).map((order) => (
                    <OrderCard
                        key={order.orderId}
                        orderId={order.orderId}
                        items={order.items}
                        status={order.status}
                    />
                ))}
            </div>

            {orders.length > 4 && (
                <Link href="/orders" className="inline-block text-sm text-[#3E93B3] hover:underline font-medium">
                    {t("view_more", {}, "View more")}
                </Link>
            )}
        </div>
    );
}
