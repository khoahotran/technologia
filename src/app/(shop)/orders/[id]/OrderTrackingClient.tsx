"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Circle, Star, Trash2 } from "lucide-react";
import { SmallLoading } from "@/components/shared/loading";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { productKeys } from "@/constants/query-keys";
import { notifyPurchase } from "@/features/ai/api";
import { getAddressById, getPaymentAccountById } from "@/features/checkout/api";
import { useCancelOrder, useDeliveryLogs, useOrder, useOrderFeedbacks, useReceiveOrder } from "@/features/orders/hooks";
import { canCancelOrder, canConfirmOrderReceived, canGiveFeedback, formatCurrencyVnd, formatDeliveryLogStatusLabel, formatOrderStatusLabel, formatPaymentMethodLabel, truncateId } from "@/features/orders/presentation";
import { getProductById } from "@/features/products/api";
import { useLanguage } from "@/providers/language.provider";
import { useAuthStore } from "@/store/auth.store";
import { useOrderFlowStore } from "@/store/order-flow.store";
import { toErrorMessage } from "@/utils/error-message";

const timelineOrder = ["PENDING", "ON_SHIPPING", "DELIVERED"] as const;

function toDisplayItemQuantity(item: unknown) {
    if (typeof item === "object" && item !== null && "quantity" in item && typeof item.quantity === "number") {
        return item.quantity;
    }
    return 1;
}

function toDisplayProductId(item: unknown): string | null {
    if (typeof item === "object" && item !== null && "productId" in item && typeof item.productId === "string") {
        return item.productId;
    }
    return null;
}

function toDisplayVariantId(item: unknown): string | null {
    if (typeof item === "object" && item !== null && "variantId" in item && typeof item.variantId === "string") {
        return item.variantId;
    }
    return null;
}

export default function OrderTrackingClient({ id }: { id: string }) {
    const { t, locale } = useLanguage();
    const currentLocale = locale === "vi" ? "vi-VN" : "en-US";
    const router = useRouter();
    const { data: order, isLoading, isError, error } = useOrder(id);
    const deliveryLogsQuery = useDeliveryLogs(id, Boolean(id));
    const { data: feedbacks } = useOrderFeedbacks(id, Boolean(id));
    const trackOrderInput = useOrderFlowStore((state) => state.trackOrderInput);
    const setTrackOrderInput = useOrderFlowStore((state) => state.setTrackOrderInput);
    const cancelOrderMutation = useCancelOrder();
    const receiveOrderMutation = useReceiveOrder();
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

    // Fetch products for order items
    const productIds = useMemo(() => {
        if (!order) return [];
        const ids = new Set<string>();
        order.items.forEach((item) => {
            const pid = toDisplayProductId(item);
            if (pid) ids.add(pid);
        });
        return [...ids];
    }, [order]);

    const productQueries = useQueries({
        queries: productIds.map((pid) => ({
            queryKey: productKeys.detail(pid),
            queryFn: () => getProductById(pid),
            enabled: !!pid,
        })),
    });

    const productMap = useMemo(() => {
        const map = new Map<string, { name: string; image: string }>();
        productQueries.forEach((q, i) => {
            const pid = productIds[i];
            if (q.data && pid) {
                map.set(pid, {
                    name: q.data.name,
                    image: q.data.variants?.[0]?.images?.[0] || "",
                });
            }
        });
        return map;
    }, [productQueries, productIds]);

    // Fetch payment account
    const paymentAccountQuery = useQuery({
        queryKey: ["payment-account", order?.paymentAccountId],
        queryFn: () => getPaymentAccountById(order!.paymentAccountId!),
        enabled: Boolean(order?.paymentAccountId) && order?.paymentMethod !== "COD",
    });

    const handleCancelOrder = () => {
        if (!order) return;
        setConfirmAction(() => () => {
            cancelOrderMutation.mutate(
                { orderId: order.orderId, sagaId: order.sagaId || "" },
                { onSuccess: () => router.push("/orders") }
            );
            setConfirmAction(null);
        });
    };

    const addressQuery = useQuery({
        queryKey: ["address", order?.addressId],
        queryFn: () => getAddressById(order!.addressId),
        enabled: Boolean(order?.addressId),
    });

    const timeline = useMemo(() => {
        if (!deliveryLogsQuery.data || deliveryLogsQuery.data.length === 0) {
            return [];
        }

        return [...deliveryLogsQuery.data]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((item) => ({
                status: item.status,
                completed: true,
                happenedAt: item.createdAt,
                message: item.message,
            }));
    }, [deliveryLogsQuery.data]);

    if (isLoading) {
        return <div className="flex justify-center p-8">{t("loading", {}, "Loading...")}</div>;
    }

    if (isError || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t("order_not_found", {}, "Order not found")}</h2>
                <p className="text-gray-600 mt-2">
                    {toErrorMessage(error, t("order_not_found_desc", {}, "We couldn't find the order you're looking for."))}
                </p>
                <Link href="/orders" className="inline-block mt-4 text-primary font-medium">
                    {t("back_to_orders", {}, "Back to list of orders")}
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-surface-muted">
                <div className="container mx-auto px-4 py-8 space-y-6">
                    <Link href="/orders" className="inline-flex items-center gap-2 text-foreground hover:text-primary-strong">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-semibold">{t("back_to_orders", {}, "Back to list of orders")}</span>
                    </Link>

                    <section className="bg-[#C3A57D] rounded-xl p-8 text-center">
                        <h1 className="text-4xl font-bold text-white">{t("track_your_order_title", {}, "Track Your Order")}</h1>
                        <div className="max-w-3xl mx-auto mt-6 bg-background border border-secondary rounded-xl p-6 grid md:grid-cols-[1fr_auto] gap-4">
                            <div className="relative">
                                <Input
                                    placeholder={t("order_id_placeholder", {}, "Order ID")}
                                    value={trackOrderInput}
                                    onChange={(event) => setTrackOrderInput(event.target.value)}
                                    className="h-12 bg-white border-secondary pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setTrackOrderInput("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <Button
                                type="button"
                                className="h-12 px-8 bg-secondary hover:bg-[#769BAD] text-white font-semibold"
                                onClick={() => {
                                    if (!trackOrderInput.trim()) {
                                        toast.error(t("order_id_required", {}, "Please enter order id"));
                                        return;
                                    }
                                    router.push(`/orders/${trackOrderInput.trim()}`);
                                }}
                            >
                                {t("track_order_btn", {}, "Track order")}
                            </Button>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl border border-accent p-8">
                        <div className="grid xl:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <h2 className="text-lg font-semibold text-foreground">#{truncateId(order.orderId, 6)}</h2>
                                <div className="space-y-3 border-y border-accent py-4">
                                    {order.items.map((item, index) => {
                                        const pid = toDisplayProductId(item);
                                        const prod = pid ? productMap.get(pid) : null;
                                        const r = item as Record<string, unknown>;
                                        const orderItemId = typeof r["orderItemId"] === "string" ? r["orderItemId"] : null;
                                        const itemFeedback = orderItemId ? feedbacks?.find((f) => f.orderItemId === orderItemId) : null;
                                        return (
                                            <div key={`${order.orderId}-${index}`} className="py-2 border-b border-gray-100 last:border-0 space-y-2">
                                                <div className="flex items-center gap-3 text-sm">
                                                    {prod?.image ? (
                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                                                            <Image src={prod.image} alt="" fill className="object-contain p-1" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
                                                    )}
                                                    <span className="text-muted-foreground">{toDisplayItemQuantity(item)}x</span>
                                                    <span className="flex-1 text-foreground truncate">{prod?.name || `Item ${index + 1}`}</span>
                                                </div>
                                                {itemFeedback && (
                                                    <div className="ml-[52px] bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-medium text-slate-700">{t("your_feedback", {}, "Your feedback")}:</span>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`h-3 w-3 ${star <= itemFeedback.rating
                                                                                ? "fill-primary text-primary"
                                                                                : "fill-transparent text-[#D3D9E0]"
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {itemFeedback.comment && (
                                                            <p className="text-slate-600 italic">"{itemFeedback.comment}"</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between text-lg font-semibold pt-2">
                                        <span className="text-foreground">{t("order_total", {}, "Order total")}</span>
                                        <span className="text-primary-strong">{formatCurrencyVnd(order.totalAmount, currentLocale)}</span>
                                    </div>
                                </div>

                                <p className="text-primary-strong text-lg font-semibold">[{formatOrderStatusLabel(order.deliveryStatus, t)}]</p>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    {feedbacks && feedbacks.length > 0 ? (
                                        <Button type="button" disabled className="bg-[#BFC7CF] text-white opacity-60 cursor-not-allowed">
                                            {t("already_feedbacked_btn", {}, "Reviewed")}
                                        </Button>
                                    ) : canGiveFeedback(order) ? (
                                        <Link href={`/orders/${order.orderId}/feedback`}>
                                            <Button type="button" className="bg-secondary hover:bg-[#769BAD] text-white">
                                                {t("give_feedback_btn", {}, "Give feedback")}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button type="button" disabled className="bg-[#BFC7CF] text-white opacity-60 cursor-not-allowed">
                                            {t("give_feedback_btn", {}, "Give feedback")}
                                        </Button>
                                    )}

                                    {canCancelOrder(order.deliveryStatus) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancelOrder}
                                            disabled={cancelOrderMutation.isPending}
                                            className="border-[#FF4D4F] text-[#FF4D4F] hover:bg-[#FFF1F0] hover:text-[#FF4D4F]"
                                        >
                                            {cancelOrderMutation.isPending ? <SmallLoading className="h-4 w-4 mr-2" /> : null}
                                            {t("cancel_order_btn", {}, "Cancel order")}
                                        </Button>
                                    )}

                                    {canConfirmOrderReceived(order.deliveryStatus) && (
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                receiveOrderMutation.mutate(order.orderId, {
                                                    onSuccess: () => {
                                                        // Notify AI Agent about the purchase completion
                                                        const { session } = useAuthStore.getState();
                                                        const customerId = session?.user.userId;

                                                        if (customerId && order.items.length > 0) {
                                                            const uniqueVariants = new Map<string, number>();
                                                            for (const item of order.items) {
                                                                const variantId = toDisplayVariantId(item);
                                                                if (variantId) {
                                                                    const current = uniqueVariants.get(variantId) ?? 0;
                                                                    uniqueVariants.set(variantId, current + toDisplayItemQuantity(item));
                                                                }
                                                            }

                                                            Promise.allSettled(
                                                                Array.from(uniqueVariants.entries()).map(([variantId, amount]) =>
                                                                    notifyPurchase({
                                                                        customerId,
                                                                        variantId,
                                                                        amount,
                                                                    })
                                                                )
                                                            );
                                                        }
                                                    }
                                                });
                                            }}
                                            disabled={receiveOrderMutation.isPending}
                                            className="bg-primary hover:bg-primary/90 text-white"
                                        >
                                            {receiveOrderMutation.isPending ? <SmallLoading className="h-4 w-4 mr-2" /> : null}
                                            {t("order_received_btn")}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {timeline.map((item, index) => (
                                    <div key={`${item.status}-${index}`} className="grid grid-cols-[20px_1fr_auto] gap-4">
                                        <div className="flex flex-col items-center">
                                            <Circle
                                                className={`h-5 w-5 ${item.completed ? "fill-[#8AB0C3] text-[#8AB0C3]" : "fill-transparent text-[#D1D7DF]"
                                                    }`}
                                            />
                                            {index < timeline.length - 1 && <div className="w-0.5 h-full min-h-8 bg-[#C8D5E0]" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {formatDeliveryLogStatusLabel(item.status, t)}
                                            </p>
                                            {item.message ? <p className="text-sm text-muted-foreground mt-1">{item.message}</p> : null}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{new Date(String(item.happenedAt).includes('Z') || String(item.happenedAt).includes('+') ? item.happenedAt : `${item.happenedAt}Z`).toLocaleString(currentLocale)}</p>
                                    </div>
                                ))}
                                {timeline.length === 0 && !deliveryLogsQuery.isError && (
                                    <p className="text-muted-foreground text-center py-8 italic">
                                        {t("no_delivery_logs", {}, "No tracking information available for this order yet.")}
                                    </p>
                                )}
                                {deliveryLogsQuery.isError ? (
                                    <p className="text-sm text-[#9A6A23]">
                                        {t("delivery_log_load_failed", {}, "Cannot load delivery logs. Please try again later.")}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </section>

                    <section className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-accent p-6">
                            <h3 className="text-2xl font-semibold text-foreground mb-4">
                                {t("shipping_address_title", {}, "Shipping Address")}
                            </h3>
                            {addressQuery.isLoading ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <SmallLoading className="h-4 w-4" />
                                    <span className="text-sm">{t("loading", {}, "Loading...")}</span>
                                </div>
                            ) : addressQuery.data ? (
                                <div className="space-y-1">
                                    <p className="text-foreground font-medium">{addressQuery.data.receiverName}</p>
                                    <p className="text-muted-foreground">{addressQuery.data.receiverPhoneNumber}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {[addressQuery.data.no, addressQuery.data.street, addressQuery.data.ward, addressQuery.data.province].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t("address_not_found", {}, "Address not found")}</p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-accent p-6">
                            <h3 className="text-2xl font-semibold text-foreground mb-4">{t("payment_info_title", {}, "Payment Info")}</h3>
                            <p className="text-foreground font-semibold mt-1">{formatPaymentMethodLabel(order.paymentMethod, t)}</p>
                            {order.paymentAccountId && order.paymentMethod !== "COD" ? (
                                paymentAccountQuery.isLoading ? (
                                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                        <SmallLoading className="h-4 w-4" />
                                        <span className="text-sm">{t("loading", {}, "Loading...")}</span>
                                    </div>
                                ) : paymentAccountQuery.data ? (
                                    <div className="space-y-1 mt-2">
                                        <p className="text-sm text-foreground font-medium">{paymentAccountQuery.data.bankName}</p>
                                        <p className="text-sm text-muted-foreground">{paymentAccountQuery.data.holderName}</p>
                                        <p className="text-sm text-muted-foreground">****{paymentAccountQuery.data.accountNumber.slice(-4)}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t("payment_account_id_label", {}, "Account")}: {truncateId(order.paymentAccountId, 6)}
                                    </p>
                                )
                            ) : null}
                        </div>
                    </section>
                </div>
            </div>

            <ConfirmDialog
                open={confirmAction !== null}
                onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
                onConfirm={() => confirmAction?.()}
                title={t("cancel_order_confirm_desc", {}, "Are you sure you want to cancel this order?")}
                confirmText={t("confirm", {}, "Confirm")}
                cancelText={t("cancel", {}, "Cancel")}
                variant="destructive"
            />
        </>
    );
}
