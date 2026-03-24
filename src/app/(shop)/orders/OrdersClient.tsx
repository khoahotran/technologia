"use client";

import { Package, PackageCheck, PackageX, Truck } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { OrderCategory } from "@/components/features/orders/OrderCard";
import { useOrders } from "@/features/orders/hooks";
import { isCreatedOrder } from "@/features/orders/presentation";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

function toOrderCardItems(order: { items: unknown[] }) {
    return order.items.slice(0, 2).map((item, index) => {
        if (typeof item !== "object" || item === null) {
            return { quantity: 1, name: `Item ${index + 1}` };
        }

        const quantity =
            "quantity" in item && typeof item.quantity === "number" ? item.quantity : 1;
        const name =
            "name" in item && typeof item.name === "string"
                ? item.name
                : "productId" in item && typeof item.productId === "string"
                    ? item.productId
                    : `Item ${index + 1}`;

        return { quantity, name };
    });
}

export default function OrdersClient() {
    const { t } = useLanguage();
    const awaitingQuery = useOrders({ page: 0, size: 20, status: "AWAITING_CONFIRM" });
    const pendingQuery = useOrders({ page: 0, size: 20, status: "PENDING" });
    const shippingQuery = useOrders({ page: 0, size: 20, status: "SHIPPING" });
    const deliveredQuery = useOrders({ page: 0, size: 20, status: "DELIVERED" });
    const canceledQuery = useOrders({ page: 0, size: 20, status: "CANCELLED" });

    const isLoading =
        awaitingQuery.isLoading ||
        pendingQuery.isLoading ||
        shippingQuery.isLoading ||
        deliveredQuery.isLoading ||
        canceledQuery.isLoading;
    const isError =
        awaitingQuery.isError ||
        pendingQuery.isError ||
        shippingQuery.isError ||
        deliveredQuery.isError ||
        canceledQuery.isError;
    const error =
        awaitingQuery.error ||
        pendingQuery.error ||
        shippingQuery.error ||
        deliveredQuery.error ||
        canceledQuery.error;

    const createdSource = useMemo(
        () => [...(awaitingQuery.data?.items ?? []), ...(pendingQuery.data?.items ?? [])],
        [awaitingQuery.data?.items, pendingQuery.data?.items]
    );
    const shippingSource = useMemo(() => shippingQuery.data?.items ?? [], [shippingQuery.data?.items]);
    const deliveredSource = useMemo(() => deliveredQuery.data?.items ?? [], [deliveredQuery.data?.items]);
    const canceledSource = useMemo(() => canceledQuery.data?.items ?? [], [canceledQuery.data?.items]);

    const orders = useMemo(
        () => [...createdSource, ...shippingSource, ...deliveredSource, ...canceledSource],
        [createdSource, shippingSource, deliveredSource, canceledSource]
    );

    const createdOrders = useMemo(
        () =>
            createdSource
                .filter((order) => isCreatedOrder(order.deliveryStatus))
                .map((order) => ({
                    orderId: order.orderId,
                    items: toOrderCardItems(order),
                    status: order.deliveryStatus,
                })),
        [createdSource]
    );

    const shippingOrders = useMemo(
        () =>
            shippingSource
                .filter((order) => order.deliveryStatus === "SHIPPING")
                .map((order) => ({
                    orderId: order.orderId,
                    items: toOrderCardItems(order),
                    status: order.deliveryStatus,
                })),
        [shippingSource]
    );

    const deliveredOrders = useMemo(
        () =>
            deliveredSource
                .filter((order) => order.deliveryStatus === "DELIVERED")
                .map((order) => ({
                    orderId: order.orderId,
                    items: toOrderCardItems(order),
                    status: order.deliveryStatus,
                })),
        [deliveredSource]
    );

    const canceledOrders = useMemo(
        () =>
            canceledSource
                .filter((order) => order.deliveryStatus === "CANCELLED")
                .map((order) => ({
                    orderId: order.orderId,
                    items: toOrderCardItems(order),
                    status: order.deliveryStatus,
                })),
        [canceledSource]
    );

    if (isLoading) {
        return <div className="flex justify-center p-8">{t("loading", {}, "Loading...")}</div>;
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t("cannot_load_orders", {}, "Cannot load orders")}</h2>
                <p className="text-sm text-gray-600 mt-2">
                    {toErrorMessage(error, t("cannot_load_orders", {}, "Cannot load orders"))}
                </p>
                <Link href="/cart" className="inline-block mt-4 text-[#3E93B3] font-medium">
                    {t("back_to_cart", {}, "Back to cart")}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F1F3]">
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-5xl font-bold text-[#1E1E1E] text-center mb-10">
                    {t("list_of_orders", {}, "List Of Orders")}
                </h1>

                {orders.length === 0 ? (
                    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-[#D3E4F4] text-center">
                        <p className="text-gray-600">{t("no_orders", {}, "You have no orders yet.")}</p>
                        <Link href="/products" className="inline-block mt-4 text-[#3E93B3] font-medium">
                            {t("start_shopping", {}, "Start shopping")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
                        <OrderCategory
                            title={t("created_orders", {}, "Created Orders")}
                            icon={<Package className="h-10 w-10 text-[#0D6E97]" />}
                            count={createdOrders.length}
                            orders={createdOrders}
                        />
                        <OrderCategory
                            title={t("shipping_orders", {}, "Paid and on shipping")}
                            icon={<Truck className="h-10 w-10 text-[#0D6E97]" />}
                            count={shippingOrders.length}
                            orders={shippingOrders}
                        />
                        <OrderCategory
                            title={t("delivered_orders", {}, "Delivered Orders")}
                            icon={<PackageCheck className="h-10 w-10 text-[#0D6E97]" />}
                            count={deliveredOrders.length}
                            orders={deliveredOrders}
                        />
                        <OrderCategory
                            title={t("cancelled_orders", {}, "Cancelled Orders")}
                            icon={<PackageX className="h-10 w-10 text-[#0D6E97]" />}
                            count={canceledOrders.length}
                            orders={canceledOrders}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
