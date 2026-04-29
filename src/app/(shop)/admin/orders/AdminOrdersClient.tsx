"use client";

import { Package, PackageCheck, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { OrderCategory } from "@/components/features/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminOrder, useAdminOrders } from "@/features/orders/hooks";
import type { DeliveryStatus } from "@/features/orders/types";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

type AdminOrderView = {
    orderId: string;
    deliveryStatus: DeliveryStatus;
    items: Array<{ quantity: number; name: string }>;
};

function toDisplayOrder(order: { orderId: string; deliveryStatus: DeliveryStatus; items: unknown[] }): AdminOrderView {
    return {
        orderId: order.orderId,
        deliveryStatus: order.deliveryStatus,
        items: order.items.slice(0, 2).map((item, index) => {
            if (typeof item !== "object" || item === null) return { quantity: 1, name: `Item ${index + 1}` };
            const itemRecord = item as Record<string, unknown>;
            const quantity = typeof itemRecord["quantity"] === "number" ? itemRecord["quantity"] : 1;
            const name =
                typeof itemRecord["name"] === "string"
                    ? itemRecord["name"]
                    : typeof itemRecord["productId"] === "string"
                        ? itemRecord["productId"]
                        : `Item ${index + 1}`;
            return { quantity, name };
        }),
    };
}

function mapOrderCards(orders: AdminOrderView[]) {
    return orders.map((order) => ({
        orderId: order.orderId,
        items: order.items,
        status: order.deliveryStatus,
    }));
}

export default function AdminOrdersClient() {
    const { t } = useLanguage();
    const [trackOrderId, setTrackOrderId] = useState("");
    const [searchOrderId, setSearchOrderId] = useState<string>("");

    const awaitingPaymentQuery = useAdminOrders({ page: 0, size: 20, status: "AWAITING_PAYMENT" });
    const awaitingConfirmQuery = useAdminOrders({ page: 0, size: 20, status: "AWAITING_CONFIRM" });
    const pendingQuery = useAdminOrders({ page: 0, size: 20, status: "PENDING" });
    const shippingQuery = useAdminOrders({ page: 0, size: 20, status: "ON_SHIPPING" });
    const deliveredQuery = useAdminOrders({ page: 0, size: 20, status: "DELIVERED" });

    const adminOrderQuery = useAdminOrder(searchOrderId, Boolean(searchOrderId));

    const trackedOrder = useMemo(() => {
        if (!adminOrderQuery.data) return null;
        return toDisplayOrder(adminOrderQuery.data);
    }, [adminOrderQuery.data]);

    const adminOrders = useMemo(() => {
        const source = [
            ...(awaitingPaymentQuery.data?.items ?? []),
            ...(awaitingConfirmQuery.data?.items ?? []),
            ...(pendingQuery.data?.items ?? []),
            ...(shippingQuery.data?.items ?? []),
            ...(deliveredQuery.data?.items ?? []),
        ].map((order) => toDisplayOrder(order));

        const dedupMap = new Map<string, AdminOrderView>();
        source.forEach((order) => dedupMap.set(order.orderId, order));
        if (trackedOrder) dedupMap.set(trackedOrder.orderId, trackedOrder);
        return Array.from(dedupMap.values());
    }, [
        awaitingPaymentQuery.data?.items,
        awaitingConfirmQuery.data?.items,
        pendingQuery.data?.items,
        shippingQuery.data?.items,
        deliveredQuery.data?.items,
        trackedOrder,
    ]);

    const filteredOrders = useMemo(() => {
        const source = adminOrders;
        if (!trackOrderId.trim()) return source;
        const keyword = trackOrderId.trim().toLowerCase();
        return source.filter((order) => order.orderId.toLowerCase().includes(keyword));
    }, [adminOrders, trackOrderId]);

    const isLoading =
        awaitingPaymentQuery.isLoading ||
        awaitingConfirmQuery.isLoading ||
        pendingQuery.isLoading ||
        shippingQuery.isLoading ||
        deliveredQuery.isLoading;

    const listError =
        awaitingPaymentQuery.error ||
        awaitingConfirmQuery.error ||
        pendingQuery.error ||
        shippingQuery.error ||
        deliveredQuery.error;

    const awaitingOrders = useMemo(
        () =>
            mapOrderCards(
                filteredOrders.filter(
                    (order) =>
                        order.deliveryStatus === "AWAITING_PAYMENT" ||
                        order.deliveryStatus === "AWAITING_CONFIRM"
                )
            ),
        [filteredOrders]
    );
    const pendingOrders = useMemo(
        () => mapOrderCards(filteredOrders.filter((order) => order.deliveryStatus === "PENDING")),
        [filteredOrders]
    );
    const shippingOrders = useMemo(
        () => mapOrderCards(filteredOrders.filter((order) => order.deliveryStatus === "ON_SHIPPING")),
        [filteredOrders]
    );
    const deliveredOrders = useMemo(
        () => mapOrderCards(filteredOrders.filter((order) => order.deliveryStatus === "DELIVERED")),
        [filteredOrders]
    );

    return (
        <div className="container mx-auto px-4 py-10 space-y-10">
            <section className="bg-[#C3A57D] rounded-xl px-8 py-10 text-center">
                <h1 className="text-6xl font-bold text-white">{t("admin_track_an_order", {}, "Track An Order")}</h1>
                <div className="mt-6 max-w-6xl mx-auto bg-[#F8F8FC] border border-[#8AB0C3] rounded-xl p-6 grid md:grid-cols-[1fr_auto] gap-4">
                    <Input
                        placeholder={t("admin_order_id", {}, "Order ID")}
                        value={trackOrderId}
                        onChange={(event) => setTrackOrderId(event.target.value)}
                        className="h-[70px] bg-white border-[#8AB0C3] text-[32px]"
                    />
                    <Button
                        className="h-[70px] px-10 bg-[#8AB0C3] hover:bg-[#6D97AB] text-[34px] text-white font-semibold"
                        onClick={() => {
                            const value = trackOrderId.trim();
                            if (!value) {
                                toast.error(t("order_id_required", {}, "Please enter order id"));
                                return;
                            }
                            setSearchOrderId(value);
                        }}
                    >
                        {t("admin_track_order", {}, "Track order")}
                    </Button>
                </div>
                {adminOrderQuery.isError && (
                    <p className="text-sm text-red-100 mt-3">
                        {toErrorMessage(adminOrderQuery.error, t("order_not_found", {}, "Order not found"))}
                    </p>
                )}
                {listError && !isLoading ? (
                    <p className="text-sm text-red-100 mt-3">
                        {toErrorMessage(listError, t("cannot_load_orders", {}, "Cannot load orders"))}
                    </p>
                ) : null}
            </section>

            {isLoading ? (
                <div className="py-12 text-center text-[#556070]">{t("loading", {}, "Loading...")}</div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
                <OrderCategory
                    title={t("admin_awaiting_confirmation_order", {}, "Awaiting Confirmation Order")}
                    icon={<Package className="h-10 w-10 text-[#0D6E97]" />}
                    count={awaitingOrders.length}
                    orders={awaitingOrders}
                />
                <OrderCategory
                    title={t("admin_pending_shipment_order", {}, "Pending Shipment Order")}
                    icon={<Truck className="h-10 w-10 text-[#0D6E97]" />}
                    count={pendingOrders.length}
                    orders={pendingOrders}
                />
                <OrderCategory
                    title={t("admin_on_shipping_order", {}, "On-shipping Order")}
                    icon={<PackageCheck className="h-10 w-10 text-[#0D6E97]" />}
                    count={shippingOrders.length}
                    orders={shippingOrders}
                />
                <OrderCategory
                    title={t("admin_completed_order", {}, "Completed Order")}
                    icon={<PackageCheck className="h-10 w-10 text-[#0D6E97]" />}
                    count={deliveredOrders.length}
                    orders={deliveredOrders}
                />
                </div>
            )}
        </div>
    );
}
