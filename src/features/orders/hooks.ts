import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    confirmCheckout,
    getOrderById,
    getOrders,
    getShippingFee,
    initCheckoutPreview,
    recalculateCheckout,
    submitOrderFeedback,
    updateOrderStatus,
} from "./api";
import type {
    CheckoutPreviewRequest,
    ConfirmCheckoutRequest,
    DeliveryStatus,
    Order,
    OrderListParams,
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

export function useShippingFee(province: string | undefined, subTotal: number, enabled: boolean) {
    return useQuery({
        queryKey: [...checkoutKeys.all, "shipping-fee", province, subTotal],
        queryFn: () => getShippingFee(province ?? "", subTotal),
        enabled: Boolean(province) && enabled,
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
        mutationFn: ({ orderId, deliveryStatus }: { orderId: string; deliveryStatus: DeliveryStatus }) =>
            updateOrderStatus(orderId, deliveryStatus),
        onSuccess: (updatedOrder: Order) => {
            queryClient.setQueryData(checkoutKeys.order(updatedOrder.orderId), updatedOrder);
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders() });
        },
        onError: (error) => {
            toast.error(toErrorMessage(error, "Unable to update order status"));
        },
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
