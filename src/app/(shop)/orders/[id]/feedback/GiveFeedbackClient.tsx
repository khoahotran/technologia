"use client";

import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useOrder, useSubmitOrderFeedback } from "@/features/orders/hooks";
import { canGiveFeedback, formatOrderStatusLabel } from "@/features/orders/presentation";
import { useLanguage } from "@/providers/language.provider";
import { useOrderFlowStore } from "@/store/order-flow.store";
import { toErrorMessage } from "@/utils/error-message";

type FeedbackItem = {
    key: string;
    label: string;
    quantity: number;
    orderItemId: string | null;
};

function toFeedbackItem(item: unknown, index: number): FeedbackItem {
    const fallbackKey = `item-${index + 1}`;
    const fallbackLabel = `Product ${index + 1}`;

    if (typeof item !== "object" || item === null) {
        return {
            key: fallbackKey,
            label: fallbackLabel,
            quantity: 1,
            orderItemId: null,
        };
    }

    const itemRecord = item as Record<string, unknown>;
    const productId = typeof itemRecord["productId"] === "string" ? itemRecord["productId"] : null;
    const orderItemId = typeof itemRecord["orderItemId"] === "string" ? itemRecord["orderItemId"] : null;
    const variantId = typeof itemRecord["variantId"] === "string" ? itemRecord["variantId"] : null;
    const name =
        typeof itemRecord["name"] === "string"
            ? itemRecord["name"]
            : typeof itemRecord["productName"] === "string"
                ? itemRecord["productName"]
                : productId ?? fallbackLabel;
    const quantity =
        typeof itemRecord["quantity"] === "number" && itemRecord["quantity"] > 0
            ? itemRecord["quantity"]
            : 1;

    return {
        key: `${productId ?? fallbackKey}-${variantId ?? "default"}`,
        label: name,
        quantity,
        orderItemId,
    };
}

export default function GiveFeedbackClient({ id }: { id: string }) {
    const { t } = useLanguage();
    const { data: order, isLoading, isError, error } = useOrder(id);
    const submitFeedback = useSubmitOrderFeedback();
    const feedbackDrafts = useOrderFlowStore((state) => state.feedbackDrafts);
    const setFeedbackDraft = useOrderFlowStore((state) => state.setFeedbackDraft);
    const clearFeedbackDrafts = useOrderFlowStore((state) => state.clearFeedbackDrafts);

    const feedbackItems = useMemo(() => {
        if (!order) return [];
        return order.items.map((item, index) => toFeedbackItem(item, index));
    }, [order]);

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
                <Link href="/orders" className="inline-block mt-4 text-[#3E93B3] font-medium">
                    {t("back_to_orders", {}, "Back to list of orders")}
                </Link>
            </div>
        );
    }

    const disabled = !canGiveFeedback(order) || submitFeedback.isPending;

    const handleSubmit = () => {
        if (!canGiveFeedback(order)) {
            toast.error(t("feedback_unavailable", {}, "Feedback is only available for delivered orders."));
            return;
        }

        const payloadItems = feedbackItems.map((item) => {
            const draft = feedbackDrafts[item.key] ?? { rating: 5, comment: "" };
            return {
                orderItemId: item.orderItemId,
                rating: draft.rating,
                comment: draft.comment.trim(),
            };
        });

        const hasMissingOrderItemId = payloadItems.some((item) => !item.orderItemId);
        if (hasMissingOrderItemId) {
            toast.error(
                t(
                    "feedback_missing_order_item_id",
                    {},
                    "Cannot submit feedback because order item id is missing from backend response."
                )
            );
            return;
        }

        const hasEmptyComment = payloadItems.some((item) => item.comment.length === 0);
        if (hasEmptyComment) {
            toast.error(t("feedback_comment_required", {}, "Please add comment for all products."));
            return;
        }

        submitFeedback.mutate(
            {
                orderId: order.orderId,
                items: payloadItems.map((item) => ({
                    orderItemId: item.orderItemId as string,
                    rating: item.rating,
                    comment: item.comment,
                })),
            },
            {
                onSuccess: () => {
                    clearFeedbackDrafts();
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-[#F4F1F3]">
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Link href={`/orders/${id}`} className="inline-flex items-center gap-2 text-[#1E1E1E] hover:text-[#0D6E97]">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-semibold">{t("back_to_tracking", {}, "Back to tracking order")}</span>
                </Link>

                <h1 className="text-5xl font-bold text-[#1E1E1E] text-center">{t("give_feedback_title", {}, "Give Feedback")}</h1>

                <div className="bg-white rounded-xl border border-[#D3E4F4] p-8">
                    <div className="space-y-2 mb-8">
                        <h3 className="text-xl font-semibold text-[#1E1E1E]">{t("order_id_label", {}, "Order ID")}</h3>
                        <p className="text-3xl font-bold text-[#1E1E1E]">#{order.orderId}</p>
                        <div className="space-y-1 py-2">
                            {feedbackItems.map((item) => (
                                <div key={`summary-${item.key}`} className="flex items-center gap-3 text-[#1E1E1E]">
                                    <span className="w-10 text-right">{item.quantity}x</span>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-lg font-semibold text-[#0D6E97]">[{formatOrderStatusLabel(order.deliveryStatus, t)}]</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 border-t border-[#D3E4F4] pt-8">
                        {feedbackItems.map((item) => {
                            const draft = feedbackDrafts[item.key] ?? { rating: 5, comment: "" };

                            return (
                                <div key={item.key} className="space-y-4">
                                    <h4 className="text-2xl font-semibold text-[#1E1E1E]">{item.label}</h4>
                                    <div>
                                        <p className="text-lg font-semibold text-[#1E1E1E] mb-2">{t("rating_label", {}, "Rating")}</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={`${item.key}-${star}`}
                                                    type="button"
                                                    className="transition-colors"
                                                    onClick={() =>
                                                        setFeedbackDraft(item.key, {
                                                            ...draft,
                                                            rating: star,
                                                        })
                                                    }
                                                    disabled={disabled}
                                                >
                                                    <Star
                                                        className={`h-8 w-8 ${
                                                            star <= draft.rating
                                                                ? "fill-[#3E93B3] text-[#3E93B3]"
                                                                : "fill-transparent text-[#D3D9E0]"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-lg font-semibold text-[#1E1E1E] mb-2">{t("comment_label", {}, "Comment")}</p>
                                        <Textarea
                                            value={draft.comment}
                                            onChange={(event) =>
                                                setFeedbackDraft(item.key, {
                                                    ...draft,
                                                    comment: event.target.value,
                                                })
                                            }
                                            className="min-h-[170px] bg-[#F9F8FE] border-[#8AB0C3]"
                                            placeholder={t(
                                                "share_experience_placeholder",
                                                {},
                                                "Share your experience with this order..."
                                            )}
                                            disabled={disabled}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center mt-8">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={disabled}
                            className="w-72 h-12 bg-[#8AB0C3] hover:bg-[#769BAD] text-white font-semibold disabled:bg-[#BFC7CF]"
                        >
                            {t("add_feedback_btn", {}, "Add feedback")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
