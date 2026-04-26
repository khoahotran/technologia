import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    confirmCheckout,
    getAdminOrders,
    getAdminOrderById,
    getDeliveryLogs,
    getOrderById,
    getOrderFeedbacks,
    getOrders,
    getProductFeedbacks,
    initCheckoutPreview,
    recalculateCheckout,
    deleteOrderFeedback,
    submitOrderFeedback,
    updateOrderFeedback,
    updateOrderStatus,
} from "./api";
import type {
    CheckoutPreviewRequest,
    AdminUpdateOrderStatus,
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
import { toErrorMessage } from "@/utils/error-message";

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

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

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
            toast.error(toErrorMessage(error, "Unable to update order status"));
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

    return useMutation({
        mutationFn: (payload: SubmitFeedbackRequest) => submitOrderFeedback(payload),
        onSuccess: (updatedOrder: Order) => {
            queryClient.setQueryData(checkoutKeys.order(updatedOrder.orderId), updatedOrder);
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders() });
            toast.success("Feedback submitted successfully");
        },
        onError: (error) => {
            toast.error(toErrorMessage(error, "Unable to submit feedback"));
        },
    });
}
