"use client";

import { useQueries } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { productKeys } from "@/constants/query-keys";
import { useOrder, useOrderFeedbacks, useSubmitOrderFeedback, useUpdateOrderFeedback } from "@/features/orders/hooks";
import { canGiveFeedback, formatOrderStatusLabel, truncateId } from "@/features/orders/presentation";
import { getProductById } from "@/features/products/api";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

type FeedbackItem = {
    key: string;
    label: string;
    quantity: number;
    orderItemId: string | null;
    productId: string | null;
    variantId: string | null;
};

function toFeedbackItem(item: unknown, index: number): FeedbackItem {
    const fallbackKey = `item-${index + 1}`;
    if (typeof item !== "object" || item === null) {
        return { key: fallbackKey, label: `Product ${index + 1}`, quantity: 1, orderItemId: null, productId: null, variantId: null };
    }
    const r = item as Record<string, unknown>;
    const productId = typeof r["productId"] === "string" ? r["productId"] : null;
    const orderItemId = typeof r["orderItemId"] === "string" ? r["orderItemId"] : null;
    const variantId = typeof r["variantId"] === "string" ? r["variantId"] : null;
    const name = typeof r["name"] === "string" ? r["name"] : typeof r["productName"] === "string" ? r["productName"] : productId ?? `Product ${index + 1}`;
    const quantity = typeof r["quantity"] === "number" && r["quantity"] > 0 ? r["quantity"] : 1;
    return {
        key: `${productId ?? fallbackKey}-${variantId ?? "default"}`,
        label: name,
        quantity,
        orderItemId,
        productId,
        variantId,
    };
}

export default function GiveFeedbackClient({ id }: { id: string }) {
    const { t } = useLanguage();
    const router = useRouter();
    const { data: order, isLoading, isError, error } = useOrder(id);
    const feedbackQuery = useOrderFeedbacks(id, Boolean(id));
    const submitFeedback = useSubmitOrderFeedback();
    const updateFeedback = useUpdateOrderFeedback();

    const [localRatings, setLocalRatings] = useState<Record<string, number>>({});
    const [localComments, setLocalComments] = useState<Record<string, string>>({});

    const feedbackItems = useMemo(() => {
        if (!order) return [];
        return order.items.map((item, index) => toFeedbackItem(item, index));
    }, [order]);

    const existingFeedbackByOrderItemId = useMemo(() => {
        const map = new Map<string, { rating: number; comment: string }>();
        (feedbackQuery.data ?? []).forEach((item) => {
            map.set(item.orderItemId, { rating: item.rating, comment: item.comment });
        });
        return map;
    }, [feedbackQuery.data]);

    useEffect(() => {
        if (feedbackItems.length === 0 || feedbackQuery.isLoading) return;

        const initialRatings: Record<string, number> = {};
        const initialComments: Record<string, string> = {};
        let hasChanges = false;

        feedbackItems.forEach((item) => {
            if (!item.orderItemId) return;
            const existing = existingFeedbackByOrderItemId.get(item.orderItemId);
            if (existing && !(item.key in localRatings)) {
                initialRatings[item.key] = existing.rating;
                initialComments[item.key] = existing.comment;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setLocalRatings((prev) => ({ ...prev, ...initialRatings }));
            setLocalComments((prev) => ({ ...prev, ...initialComments }));
        }
    }, [existingFeedbackByOrderItemId, feedbackItems, feedbackQuery.isLoading]);

    const hasFeedback = feedbackQuery.data && feedbackQuery.data.length > 0;

    const productIds = useMemo(() => {
        const ids = new Set<string>();
        feedbackItems.forEach((item) => { if (item.productId) ids.add(item.productId); });
        return [...ids];
    }, [feedbackItems]);

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

    if (isLoading) {
        return <div className="flex justify-center p-8">{t("loading", {}, "Loading...")}</div>;
    }

    if (isError || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t("order_not_found", {}, "Order not found")}</h2>
                <p className="text-sm text-gray-600 mt-2">
                    {toErrorMessage(error, t("order_not_found", {}, "Order not found"))}
                </p>
                <Link href="/orders" className="inline-block mt-4 text-primary font-medium">
                    {t("back_to_orders", {}, "Back to list of orders")}
                </Link>
            </div>
        );
    }

    if (!canGiveFeedback(order)) {
        return (
            <div className="min-h-screen bg-surface-muted">
                <div className="container mx-auto px-4 py-8 space-y-6">
                    <Link href={`/orders/${id}`} className="inline-flex items-center gap-2 text-foreground hover:text-primary-strong">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-semibold">{t("back_to_tracking", {}, "Back to tracking order")}</span>
                    </Link>
                    <div className="bg-white rounded-xl border border-accent p-8 text-center">
                        <h1 className="text-3xl font-bold text-foreground">{t("give_feedback_title", {}, "Give Feedback")}</h1>
                        <p className="text-muted-foreground mt-4">{t("feedback_unavailable", {}, "Feedback is only available for delivered orders.")}</p>
                        <p className="text-primary-strong font-semibold mt-2">[{formatOrderStatusLabel(order.deliveryStatus, t)}]</p>
                    </div>
                </div>
            </div>
        );
    }

    const getRating = (key: string) => localRatings[key] ?? existingFeedbackByOrderItemId.get(feedbackItems.find((f) => f.key === key)?.orderItemId ?? "")?.rating ?? 5;
    const getComment = (key: string) => localComments[key] ?? existingFeedbackByOrderItemId.get(feedbackItems.find((f) => f.key === key)?.orderItemId ?? "")?.comment ?? "";

    const isPending = submitFeedback.isPending || updateFeedback.isPending;
    const isSubmitting = isPending;

    const handleSubmit = () => {
        const payloadItems = feedbackItems.map((item) => ({
            orderItemId: item.orderItemId,
            rating: getRating(item.key),
            comment: getComment(item.key).trim(),
        }));

        const hasMissingOrderItemId = payloadItems.some((item) => !item.orderItemId);
        if (hasMissingOrderItemId) {
            toast.error(t("feedback_missing_order_item_id", {}, "Cannot submit feedback because order item id is missing from backend response."));
            return;
        }

        const hasEmptyComment = payloadItems.some((item) => item.comment.length === 0);
        if (hasEmptyComment) {
            toast.error(t("feedback_comment_required", {}, "Please add comment for all products."));
            return;
        }

        const normalized = payloadItems.map((item) => ({
            orderItemId: item.orderItemId as string,
            rating: item.rating,
            comment: item.comment,
        }));

        const toCreate = normalized.filter((item) => !existingFeedbackByOrderItemId.has(item.orderItemId));
        const toUpdate = normalized.filter((item) => existingFeedbackByOrderItemId.has(item.orderItemId));

        Promise.all([
            toCreate.length > 0
                ? submitFeedback.mutateAsync({ orderId: order.orderId, items: toCreate })
                : Promise.resolve(),
            ...toUpdate.map((item) => updateFeedback.mutateAsync({ orderItemId: item.orderItemId, rating: item.rating, comment: item.comment })),
        ])
            .then(() => {
                toast.success(t("feedback_saved", {}, "Feedback saved successfully"));
                setLocalRatings({});
                setLocalComments({});
                router.push(`/orders/${id}`);
            })
            .catch((submitError: unknown) => {
                toast.error(toErrorMessage(submitError, t("unable_save_feedback", {}, "Unable to save feedback")));
            });
    };

    return (
        <div className="min-h-screen bg-surface-muted">
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Link href={`/orders/${id}`} className="inline-flex items-center gap-2 text-foreground hover:text-primary-strong">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-semibold">{t("back_to_tracking", {}, "Back to tracking order")}</span>
                </Link>

                <h1 className="text-5xl font-bold text-foreground text-center">{t("give_feedback_title", {}, "Give Feedback")}</h1>

                <div className="bg-white rounded-xl border border-accent p-8">
                    <div className="space-y-2 mb-8">
                        <h3 className="text-xl font-semibold text-foreground">{t("order_id_label", {}, "Order ID")}</h3>
                        <p className="text-3xl font-bold text-foreground">#{truncateId(order.orderId, 6)}</p>
                        <div className="space-y-1 py-2">
                            {feedbackItems.map((item) => {
                                const prod = item.productId ? productMap.get(item.productId) : null;
                                return (
                                    <div key={`summary-${item.key}`} className="flex items-center gap-3 text-foreground">
                                        {prod?.image ? (
                                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                                                <Image src={prod.image} alt="" fill className="object-contain p-0.5" />
                                            </div>
                                        ) : null}
                                        <span className="w-10 text-right shrink-0">{item.quantity}x</span>
                                        <span className="truncate">{prod?.name ?? item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-lg font-semibold text-primary-strong">[{formatOrderStatusLabel(order.deliveryStatus, t)}]</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 border-t border-accent pt-8">
                        {feedbackItems.map((item) => {
                            const rating = getRating(item.key);
                            const comment = getComment(item.key);
                            const prod = item.productId ? productMap.get(item.productId) : null;

                            return (
                                <div key={item.key} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        {prod?.image ? (
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                                                <Image src={prod.image} alt="" fill className="object-contain p-1" />
                                            </div>
                                        ) : null}
                                        <h4 className="text-2xl font-semibold text-foreground">{prod?.name ?? item.label}</h4>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-foreground mb-2">{t("rating_label", {}, "Rating")}</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={`${item.key}-${star}`}
                                                    type="button"
                                                    className="transition-colors hover:scale-110"
                                                    onClick={() => setLocalRatings((prev) => ({ ...prev, [item.key]: star }))}
                                                    disabled={isSubmitting}
                                                    aria-label={t("rate_n_stars", { count: star }, `Rate ${star} stars`)}
                                                >
                                                    <Star
                                                        className={`h-8 w-8 ${
                                                            star <= rating
                                                                ? "fill-[#3E93B3] text-primary"
                                                                : "fill-transparent text-[#D3D9E0]"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-lg font-semibold text-foreground mb-2">{t("comment_label", {}, "Comment")}</p>
                                        <Textarea
                                            value={comment}
                                            onChange={(event) =>
                                                setLocalComments((prev) => ({ ...prev, [item.key]: event.target.value }))
                                            }
                                            className="min-h-[170px] bg-background border-secondary"
                                            placeholder={t("share_experience_placeholder", {}, "Share your experience with this order...")}
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasFeedback ? (
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            {t("feedback_edit_note", {}, "You have already submitted feedback. You can edit it below.")}
                        </p>
                    ) : null}

                    <div className="flex justify-center mt-8">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-72 h-12 bg-secondary hover:bg-[#769BAD] text-white font-semibold disabled:bg-[#BFC7CF]"
                        >
                            {hasFeedback ? t("update_feedback_btn", {}, "Update feedback") : t("add_feedback_btn", {}, "Add feedback")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}