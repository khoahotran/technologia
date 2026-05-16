import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import {
    cancelOrder,
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
    getPaymentQrCode,
    getProductFeedbacks,
    initCheckoutPreview,
    recalculateCheckout,
    receiveOrder,
    simulatePayment,
    submitOrderFeedback,
    updateOrderFeedback,
    updateOrderStatus,
} from "./api";
import type {
    AdminUpdateOrderStatus,
    CancelOrderRequest,
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
            queryClient.invalidateQueries({ queryKey: ["cart"], refetchType: "all" });
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
        mutationFn: ({ orderId, sagaId }: { orderId: string; sagaId: string }) =>
            createPayment(orderId, sagaId),
    });
}

export function usePaymentQrCode(paymentId: string, enabled = true) {
    return useQuery({
        queryKey: ["payment-qr", paymentId],
        queryFn: () => getPaymentQrCode(paymentId),
        enabled: Boolean(paymentId) && enabled,
    });
}

export function useSimulatePayment() {
    return useMutation({
        mutationFn: ({ orderId, paymentId, sagaId }: { orderId: string; paymentId: string; sagaId: string }) =>
            simulatePayment(orderId, paymentId, sagaId),
    });
}

export function useCancelPayment() {
    return useMutation({
        mutationFn: ({ orderId, paymentId, sagaId }: { orderId: string; paymentId: string; sagaId: string }) =>
            cancelPayment(orderId, paymentId, sagaId),
    });
}

export function useCancelOrder() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (payload: CancelOrderRequest) => cancelOrder(payload),
        onSuccess: async (_, variables) => {
            // 1. Invalidate all checkout-related queries
            await queryClient.invalidateQueries({ queryKey: checkoutKeys.all });

            // 2. Specifically remove orders list from cache to force a fresh fetch 
            // and show loading state instead of stale data when navigating back
            queryClient.removeQueries({ queryKey: checkoutKeys.orders(), exact: false });

            // 3. Update the specific order in cache if it exists (Optimistic-like)
            queryClient.invalidateQueries({ queryKey: checkoutKeys.order(variables.orderId) });

            toast.success(t('order_canceled_success', {}, "Order canceled successfully"));
        },
        onError: (error) => {
            toast.error(t(toErrorMessage(error, 'failed_cancel_order')));
        },
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ orderId, deliveryStatus }: { orderId: string; deliveryStatus: AdminUpdateOrderStatus }) =>
            updateOrderStatus(orderId, deliveryStatus),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: checkoutKeys.all });
            queryClient.removeQueries({ queryKey: checkoutKeys.orders(), exact: false });
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, "admin-order", variables.orderId] });
        },
        onError: (error) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_update_order_status')));
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
            toast.error(t(toErrorMessage(error, 'failed_submit_feedback')));
        },
    });
}

export function useReceiveOrder() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (orderId: string) => receiveOrder(orderId),
        onSuccess: async (_, orderId) => {
            await queryClient.invalidateQueries({ queryKey: checkoutKeys.all });
            queryClient.invalidateQueries({ queryKey: checkoutKeys.order(orderId) });
            toast.success(t('order_received_success'));
        },
        onError: (error) => {
            toast.error(t(toErrorMessage(error, 'failed_confirm_received')));
        },
    });
}
