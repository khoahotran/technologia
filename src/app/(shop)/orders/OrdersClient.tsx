"use client";

import { useQueries } from "@tanstack/react-query";
import { Package, PackageCheck, PackageX, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { OrderCategory } from "@/components/features/orders/OrderCard";
import { productKeys } from "@/constants/query-keys";
import { useAuth } from "@/features/auth/hooks";
import { useOrders } from "@/features/orders/hooks";
import { isCreatedOrder } from "@/features/orders/presentation";
import { getProductById } from "@/features/products/api";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";
import { FullLoading } from "@/components/shared/loading";

function extractProductIds(orders: Array<{ items: unknown[] }>): string[] {
    const ids = new Set<string>();
    orders.forEach((order) => {
        order.items.slice(0, 2).forEach((item) => {
            if (typeof item === "object" && item !== null) {
                const r = item as Record<string, unknown>;
                if (typeof r["productId"] === "string") ids.add(r["productId"]);
            }
        });
    });
    return [...ids];
}

function buildItemName(item: unknown, index: number, productMap: Map<string, string>): string {
    if (typeof item !== "object" || item === null) return `Item ${index + 1}`;
    const r = item as Record<string, unknown>;
    if ("name" in r && typeof r["name"] === "string") return r["name"] as string;
    if ("productName" in r && typeof r["productName"] === "string") return r["productName"] as string;
    if ("productId" in r && typeof r["productId"] === "string") {
        const pid = r["productId"] as string;
        return productMap.get(pid) ?? pid;
    }
    return `Item ${index + 1}`;
}

export default function OrdersClient() {
    const { t } = useLanguage();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    const awaitingPaymentQuery = useOrders({ page: 0, size: 20, status: "AWAITING_PAYMENT" });
    const awaitingQuery = useOrders({ page: 0, size: 20, status: "AWAITING_CONFIRM" });
    const pendingQuery = useOrders({ page: 0, size: 20, status: "PENDING" });
    const shippingQuery = useOrders({ page: 0, size: 20, status: "ON_SHIPPING" });
    const deliveredQuery = useOrders({ page: 0, size: 20, status: "DELIVERED" });
    const receivedQuery = useOrders({ page: 0, size: 20, status: "RECEIVED" });
    const canceledQuery = useOrders({ page: 0, size: 20, status: "CANCELED" });

    const isLoading =
        awaitingPaymentQuery.isLoading ||
        awaitingQuery.isLoading ||
        pendingQuery.isLoading ||
        shippingQuery.isLoading ||
        deliveredQuery.isLoading ||
        receivedQuery.isLoading ||
        canceledQuery.isLoading;
    const isError =
        awaitingPaymentQuery.isError ||
        awaitingQuery.isError ||
        pendingQuery.isError ||
        shippingQuery.isError ||
        deliveredQuery.isError ||
        receivedQuery.isError ||
        canceledQuery.isError;
    const error =
        awaitingPaymentQuery.error ||
        awaitingQuery.error ||
        pendingQuery.error ||
        shippingQuery.error ||
        deliveredQuery.error ||
        receivedQuery.error ||
        canceledQuery.error;

    const createdSource = useMemo(
        () => [...(awaitingQuery.data?.items ?? []), ...(pendingQuery.data?.items ?? [])],
        [awaitingQuery.data?.items, pendingQuery.data?.items]
    );
    const awaitingPaymentSource = useMemo(
        () => awaitingPaymentQuery.data?.items ?? [],
        [awaitingPaymentQuery.data?.items]
    );
    const shippingSource = useMemo(() => shippingQuery.data?.items ?? [], [shippingQuery.data?.items]);
    const deliveredSource = useMemo(
        () => [...(deliveredQuery.data?.items ?? []), ...(receivedQuery.data?.items ?? [])],
        [deliveredQuery.data?.items, receivedQuery.data?.items]
    );
    const canceledSource = useMemo(() => canceledQuery.data?.items ?? [], [canceledQuery.data?.items]);

    const orders = useMemo(
        () => [...awaitingPaymentSource, ...createdSource, ...shippingSource, ...deliveredSource, ...canceledSource],
        [awaitingPaymentSource, createdSource, shippingSource, deliveredSource, canceledSource]
    );

    // Fetch product names for order items
    const allProductIds = useMemo(
        () => extractProductIds([...awaitingPaymentSource, ...createdSource, ...shippingSource, ...deliveredSource, ...canceledSource]),
        [awaitingPaymentSource, createdSource, shippingSource, deliveredSource, canceledSource]
    );

    const productQueries = useQueries({
        queries: allProductIds.map((pid) => ({
            queryKey: productKeys.detail(pid),
            queryFn: () => getProductById(pid),
            enabled: !!pid,
        })),
    });

    const productMap = useMemo(() => {
        const map = new Map<string, string>();
        productQueries.forEach((q, i) => {
            const pid = allProductIds[i];
            if (q.data && pid) map.set(pid, q.data.name);
        });
        return map;
    }, [productQueries, allProductIds]);

    const toOrderCardItems = useCallback(
        (order: { items: unknown[] }) =>
            order.items.slice(0, 2).map((item, index) => ({
                quantity: (typeof item === "object" && item !== null && "quantity" in item && typeof (item as Record<string, unknown>)["quantity"] === "number")
                    ? (item as Record<string, unknown>)["quantity"] as number : 1,
                name: buildItemName(item, index, productMap),
            })),
        [productMap]
    );

    const createdOrders = useMemo(
        () =>
            [...awaitingPaymentSource, ...createdSource]
                .filter((order) => isCreatedOrder(order.deliveryStatus))
                .map((order) => ({
                    orderId: order.orderId,
                    items: toOrderCardItems(order),
                    status: order.deliveryStatus,
                })),
        [awaitingPaymentSource, createdSource, toOrderCardItems]
    );

    const shippingOrders = useMemo(
        () =>
            shippingSource
                .filter((order) => order.deliveryStatus === "ON_SHIPPING")
                .map((order) => ({
                    orderId: order.orderId,
                    items: toOrderCardItems(order),
                    status: order.deliveryStatus,
                })),
        [shippingSource, toOrderCardItems]
    );

    const deliveredOrders = useMemo(
        () =>
            deliveredSource
                .filter((order) => order.deliveryStatus === "DELIVERED" || order.deliveryStatus === "RECEIVED")
                .map((order) => ({
                    orderId: order.orderId,
                    items: toOrderCardItems(order),
                    status: order.deliveryStatus,
                })),
        [deliveredSource, toOrderCardItems]
    );

    const canceledOrders = useMemo(
        () =>
            canceledSource
                .filter((order) => order.deliveryStatus === "CANCELED")
                .map((order) => ({
                    orderId: order.orderId,
                    items: toOrderCardItems(order),
                    status: order.deliveryStatus,
                })),
        [canceledSource, toOrderCardItems]
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <FullLoading message={t("loading", {}, "Loading...")} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t("cannot_load_orders", {}, "Cannot load orders")}</h2>
                <p className="text-sm text-gray-600 mt-2">
                    {toErrorMessage(error, t("cannot_load_orders", {}, "Cannot load orders"))}
                </p>
                <Link href="/cart" className="inline-block mt-4 text-primary font-medium">
                    {t("back_to_cart", {}, "Back to cart")}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-muted">
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-5xl font-bold text-foreground text-center mb-10">
                    {t("list_of_orders", {}, "List Of Orders")}
                </h1>

                {orders.length === 0 ? (
                    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-accent text-center">
                        <p className="text-gray-600">{t("no_orders", {}, "You have no orders yet.")}</p>
                        <Link href="/products" className="inline-block mt-4 text-primary font-medium">
                            {t("start_shopping", {}, "Start shopping")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
                        <OrderCategory
                            title={t("created_orders", {}, "Created Orders")}
                            icon={<Package className="h-10 w-10 text-primary-strong" />}
                            count={createdOrders.length}
                            orders={createdOrders}
                        />
                        <OrderCategory
                            title={t("shipping_orders", {}, "Paid and on shipping")}
                            icon={<Truck className="h-10 w-10 text-primary-strong" />}
                            count={shippingOrders.length}
                            orders={shippingOrders}
                        />
                        <OrderCategory
                            title={t("delivered_orders", {}, "Delivered Orders")}
                            icon={<PackageCheck className="h-10 w-10 text-primary-strong" />}
                            count={deliveredOrders.length}
                            orders={deliveredOrders}
                        />
                        <OrderCategory
                            title={t("cancelled_orders", {}, "Cancelled Orders")}
                            icon={<PackageX className="h-10 w-10 text-primary-strong" />}
                            count={canceledOrders.length}
                            orders={canceledOrders}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
