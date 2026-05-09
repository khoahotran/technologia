"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUpdateOrderStatus } from "@/features/orders/hooks";
import { formatOrderStatusLabel, getNextStatusOptions, truncateId } from "@/features/orders/presentation";
import type { AdminUpdateOrderStatus, DeliveryStatus } from "@/features/orders/types";
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
    isAdmin?: boolean;
}

function getStatusColor(status: DeliveryStatus) {
    if (status === "DELIVERED") return "bg-[#EB8435] text-white";
    return "bg-[#8AB0C3] text-white";
}

export function OrderCard({ orderId, items, status, className, isAdmin }: OrderCardProps) {
    const { t } = useLanguage();
    const updateStatusMutation = useUpdateOrderStatus();
    const nextOptions = getNextStatusOptions(status);
    const [pendingStatus, setPendingStatus] = useState<DeliveryStatus | null>(null);

    const handleUpdateStatus = (newStatus: DeliveryStatus) => {
        setPendingStatus(newStatus);
    };

    const confirmUpdateStatus = () => {
        if (!pendingStatus) return;
        updateStatusMutation.mutate({ orderId, deliveryStatus: pendingStatus as AdminUpdateOrderStatus });
        setPendingStatus(null);
    };

    return (
        <div className={cn("bg-white rounded-lg border border-[#D3E4F4] overflow-hidden flex flex-col", className)}>
            <Link
                href={isAdmin ? `/admin/orders?search=${orderId}` : `/orders/${orderId}`}
                className={cn(
                    "px-4 py-2 text-sm font-semibold flex items-center justify-between hover:brightness-95 transition-colors",
                    getStatusColor(status)
                )}
            >
                <span>#{truncateId(orderId, 6)}</span>
                <span className="text-xs text-white">{t("view_detail", {}, "View detail")}</span>
            </Link>

            <div className="p-4 space-y-2 flex-1">
                {items.slice(0, 2).map((item, index) => (
                    <div key={`${orderId}-${index}`} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-gray-600">{item.quantity}x</span>
                        <span className="truncate">{item.name}</span>
                    </div>
                ))}
            </div>

            {isAdmin && nextOptions.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-[#D3E4F4] flex flex-wrap gap-2">
                    {nextOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleUpdateStatus(option)}
                            disabled={updateStatusMutation.isPending}
                            className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase",
                                option === "CANCELED"
                                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                            )}
                        >
                            {updateStatusMutation.isPending && updateStatusMutation.variables?.deliveryStatus === option ? (
                                <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                            ) : null}
                            {formatOrderStatusLabel(option, t)}
                        </button>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={pendingStatus !== null}
                onOpenChange={(open) => { if (!open) setPendingStatus(null); }}
                onConfirm={confirmUpdateStatus}
                title={t("admin_confirm_update_status", {}, "Are you sure you want to update status?")}
                description={pendingStatus ? `${t("admin_confirm_update_status", {}, "Are you sure you want to update status to")} ${formatOrderStatusLabel(pendingStatus, t)}?` : ""}
                confirmText={t("confirm", {}, "Confirm")}
                cancelText={t("cancel", {}, "Cancel")}
            />
        </div>
    );
}

interface OrderCategoryProps {
    title: string;
    icon: ReactNode;
    count?: number;
    orders: Array<{ orderId: string; items: OrderCardItem[]; status: DeliveryStatus }>;
    isAdmin?: boolean;
}

export function OrderCategory({ title, icon, count, orders, isAdmin }: OrderCategoryProps) {
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
                {orders.map((order) => (
                    <OrderCard
                        key={order.orderId}
                        orderId={order.orderId}
                        items={order.items}
                        status={order.status}
                        isAdmin={!!isAdmin}
                    />
                ))}
            </div>

            {/* {orders.length > 4 && (
                <Link href="/orders" className="inline-block text-sm text-[#3E93B3] hover:underline font-medium">
                    {t("view_more", {}, "View more")}
                </Link>
            )} */}
        </div>
    );
}
