import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import {
    cancelPayment,
    confirmCheckout,
    createPayment,
    deleteOrderFeedback,
    getAdminOrderById,
    getAdminOrders,
    getDeliveryLogs,
    getOrderById,
    getOrderFeedbacks,
    getOrderIdBySagaId,
    getOrders,
    getProductFeedbacks,
    initCheckoutPreview,
    recalculateCheckout,
    simulatePayment,
    submitOrderFeedback,
    updateOrderFeedback,
    updateOrderStatus,
} from "./api";
import type {
    AdminUpdateOrderStatus,
    CheckoutPreviewRequest,
    ConfirmCheckoutRequest,
    DeliveryLog,
    Order,
    OrderFeedback,
    OrderListParams,
    ProductFeedbackParams,
    RecalculateCheckoutRequest,
    SubmitFeedbackRequest,
} from "./types";

import { checkoutKeys } from "@/constants/query-keys";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";
import { logger } from "@/utils/logger";

export function useOrders(params?: OrderListParams) {
    return useQuery({
        queryKey: checkoutKeys.orders(params),
        queryFn: () => getOrders(params),
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: checkoutKeys.order(id),
        queryFn: () => getOrderById(id),
        enabled: Boolean(id),
    });
}

export function useAdminOrders(params?: OrderListParams) {
    return useQuery({
        queryKey: [...checkoutKeys.all, "admin-orders", params],
        queryFn: () => getAdminOrders(params),
    });
}

export function useAdminOrder(id: string, enabled = true) {
    return useQuery({
        queryKey: [...checkoutKeys.all, "admin-order", id],
        queryFn: () => getAdminOrderById(id),
        enabled: Boolean(id) && enabled,
    });
}

export function useDeliveryLogs(orderId: string, enabled = true) {
    return useQuery<DeliveryLog[]>({
        queryKey: [...checkoutKeys.all, "delivery-logs", orderId],
        queryFn: () => getDeliveryLogs(orderId),
        enabled: Boolean(orderId) && enabled,
    });
}

export function useOrderFeedbacks(orderId: string, enabled = true) {
    return useQuery<OrderFeedback[]>({
        queryKey: [...checkoutKeys.all, "order-feedbacks", orderId],
        queryFn: () => getOrderFeedbacks(orderId),
        enabled: Boolean(orderId) && enabled,
    });
}

export function useProductFeedbacks(params: ProductFeedbackParams, enabled = true) {
    return useQuery({
        queryKey: [...checkoutKeys.all, "product-feedbacks", params],
        queryFn: () => getProductFeedbacks(params),
        enabled,
    });
}

export function useCheckoutPreview() {
    return useMutation({
        mutationFn: (payload: CheckoutPreviewRequest) => initCheckoutPreview(payload),
    });
}

export function useRecalculateCheckout() {
    return useMutation({
        mutationFn: (payload: RecalculateCheckoutRequest) => recalculateCheckout(payload),
    });
}

export function useConfirmCheckout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ConfirmCheckoutRequest) => confirmCheckout(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders() });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
}

export function useGetOrderIdBySagaId() {
    return useCallback(async (sagaId: string): Promise<string | null> => {
        let attempts = 0;
        const maxAttempts = 6;

        while (attempts < maxAttempts) {
            try {
                await new Promise((resolve) => setTimeout(resolve, 2000));

                const orderId = await getOrderIdBySagaId(sagaId);

                if (orderId) return orderId;
            } catch {
                logger.error(`Attempt ${attempts + 1}: Order service chưa phản hồi ID, tiếp tục đợi...`);
            }

            attempts++;
        }
        return null;
    }, []);
}

export function useCreatePayment() {
    return useMutation({
        mutationFn: ({ orderId, sagaId, paymentMethod }: { orderId: string; sagaId: string; paymentMethod: string }) =>
            createPayment(orderId, sagaId, paymentMethod),
    });
}

export function useSimulatePayment() {
    return useMutation({
        mutationFn: ({ orderId, paymentId }: { orderId: string; paymentId: string }) =>
            simulatePayment(orderId, paymentId),
    });
}

export function useCancelPayment() {
    return useMutation({
        mutationFn: ({ orderId, paymentId }: { orderId: string; paymentId: string }) =>
            cancelPayment(orderId, paymentId),
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ orderId, deliveryStatus }: { orderId: string; deliveryStatus: AdminUpdateOrderStatus }) =>
            updateOrderStatus(orderId, deliveryStatus),
        onSuccess: (_: void, variables) => {
            queryClient.invalidateQueries({ queryKey: checkoutKeys.order(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, "admin-order", variables.orderId] });
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders() });
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, "delivery-logs", variables.orderId] });
        },
        onError: (error) => {
            toast.error(toErrorMessage(error, t('admin_failed_update_order_status', {}, "Unable to update order status")));
        },
    });
}

export function useUpdateOrderFeedback() {
    return useMutation({
        mutationFn: ({ orderItemId, rating, comment }: { orderItemId: string; rating: number; comment: string }) =>
            updateOrderFeedback(orderItemId, rating, comment),
    });
}

export function useDeleteOrderFeedback() {
    return useMutation({
        mutationFn: (orderItemId: string) => deleteOrderFeedback(orderItemId),
    });
}

export function useSubmitOrderFeedback() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (payload: SubmitFeedbackRequest) => submitOrderFeedback(payload),
        onSuccess: (updatedOrder: Order) => {
            queryClient.setQueryData(checkoutKeys.order(updatedOrder.orderId), updatedOrder);
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders() });
            toast.success(t('feedback_submitted_success', {}, "Feedback submitted successfully"));
        },
        onError: (error) => {
            toast.error(toErrorMessage(error, t('failed_submit_feedback', {}, "Unable to submit feedback")));
        },
    });
}
