import {
    CheckoutRecalculateResponseSchema,
    CheckoutPreviewResponseSchema,
    DeliveryLogSchema,
    OrderFeedbackSchema,
    OrderSchema,
    AdminUpdateOrderStatusSchema,
    type CheckoutPreviewRequest,
    type CheckoutPreviewResponse,
    type CheckoutRecalculateResponse,
    type ConfirmCheckoutRequest,
    type AdminUpdateOrderStatus,
    type DeliveryLog,
    type Order,
    type OrderFeedback,
    type OrderListParams,
    type PaginatedOrders,
    type ProductFeedbackParams,
    type RecalculateCheckoutRequest,
    type SubmitFeedbackRequest,
    type CancelOrderRequest,
} from "./types";

import { del, get, patch, post, put } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

export async function getOrders(params?: OrderListParams): Promise<PaginatedOrders> {
    const endpoint = params?.status ? "/api/orders/by-delivery-status" : "/api/orders";
    const response = await get<PaginatedResponse<Order>>(endpoint, {
        params: {
            page: params?.page ?? 0,
            size: params?.size ?? 20,
            sortBy: params?.sortBy,
            sortDirection: params?.sortDirection,
            deliveryStatus: params?.status,
        },
    });

    const items = response.data.map((item) => OrderSchema.parse(item));

    return {
        pageNumber: response.page_number,
        pageSize: response.page_size,
        totalItems: response.count_items,
        totalPages: response.count_pages,
        items,
    };
}

export async function getOrderById(id: string): Promise<Order | null> {
    const response = await get<ApiResponse<Order>>(`/api/orders/${id}`);
    return OrderSchema.parse(response.data);
}

export async function getAdminOrders(params?: OrderListParams): Promise<PaginatedOrders> {
    const response = await get<PaginatedResponse<Order>>("/api/orders/admin", {
        params: {
            page: params?.page ?? 0,
            size: params?.size ?? 20,
            sortBy: params?.sortBy,
            sortDirection: params?.sortDirection,
            status: params?.status,
        },
    });

    const items = response.data
        .map((item) => {
            const result = OrderSchema.safeParse(item);
            if (!result.success) {
                console.warn("[Orders] Skipping invalid admin order:", result.error.issues, item.orderId);
            }
            return result.success ? result.data : null;
        })
        .filter((item): item is Order => item !== null);
    return {
        pageNumber: response.page_number,
        pageSize: response.page_size,
        totalItems: response.count_items,
        totalPages: response.count_pages,
        items,
    };
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
    const response = await get<ApiResponse<Order>>(`/api/orders/admin/${id}`);
    return OrderSchema.parse(response.data);
}

export async function initCheckoutPreview(
    input: CheckoutPreviewRequest
): Promise<CheckoutPreviewResponse> {
    const response = await post<ApiResponse<CheckoutPreviewResponse>>(
        "/api/checkout/preview/init",
        {
            cartItemIds: input.cartItemIds,
            voucherCode: input.voucherCode,
        }
    );
    return CheckoutPreviewResponseSchema.parse(response.data);
}

export async function recalculateCheckout(
    input: RecalculateCheckoutRequest
): Promise<CheckoutRecalculateResponse> {
    const response = await post<ApiResponse<CheckoutRecalculateResponse>>(
        "/api/checkout/recalculate",
        {
            checkoutSessionId: input.checkoutSessionId,
            voucherCode: input.voucherCode,
            addressId: input.addressId,
            note: input.note,
        }
    );
    return CheckoutRecalculateResponseSchema.parse(response.data);
}

export async function confirmCheckout(input: ConfirmCheckoutRequest): Promise<string> {
    const response = await post<ApiResponse<{ sagaId: string }>>("/api/checkout/confirm", input);
    return response.data.sagaId;
}

export async function getOrderIdBySagaId(sagaId: string): Promise<string | null> {
    const response = await get<ApiResponse<{ orderId: string }>>(`/api/sagas/get-order/${sagaId}`);
    return response.data?.orderId || null;
}

export async function getDeliveryLogs(orderId: string): Promise<DeliveryLog[]> {
    const response = await get<ApiResponse<DeliveryLog[]>>(`/api/delivery-logs/order/${orderId}`);
    return response.data.map((log) => DeliveryLogSchema.parse(log));
}

export async function updateOrderStatus(orderId: string, deliveryStatus: AdminUpdateOrderStatus): Promise<void> {
    const nextStatus = AdminUpdateOrderStatusSchema.parse(deliveryStatus);
    await patch(`/api/orders/admin/${orderId}/status`, {
        newStatus: nextStatus,
    });
}

export async function createPayment(orderId: string, sagaId: string): Promise<string> {
    const response = await post<ApiResponse<{ paymentId: string }>>("/api/payments", {
        orderId,
        sagaId,
    });
    return response.data.paymentId;
}

export async function simulatePayment(orderId: string, paymentId: string, sagaId: string): Promise<void> {
    await post("/api/payments/simulate", { orderId, paymentId, sagaId });
}

export async function getPaymentQrCode(paymentId: string): Promise<{ qrCode: string; expiredAt: string }> {
    const response = await get<ApiResponse<{ qrCode: string; expiredAt: string }>>(`/api/payments/${paymentId}/qr`);
    return response.data;
}

export async function cancelPayment(orderId: string, paymentId: string, sagaId: string): Promise<void> {
    await post("/api/payments/simulate/cancel", { orderId, paymentId, sagaId });
}

export async function submitOrderFeedback(payload: SubmitFeedbackRequest): Promise<Order> {
    await Promise.all(
        payload.items.map((item) =>
            post("/api/orders/feedback", {
                orderItemId: item.orderItemId,
                rating: item.rating,
                comment: item.comment,
            })
        )
    );

    const existingOrder = await getOrderById(payload.orderId);
    if (!existingOrder) {
        throw new Error("Order not found after submitting feedback.");
    }

    return OrderSchema.parse(existingOrder);
}

export async function updateOrderFeedback(orderItemId: string, rating: number, comment: string): Promise<void> {
    await put(`/api/orders/feedback/${orderItemId}`, { rating, comment });
}

export async function deleteOrderFeedback(orderItemId: string): Promise<void> {
    await del(`/api/orders/feedback/${orderItemId}`);
}

export async function getOrderFeedbacks(orderId: string): Promise<OrderFeedback[]> {
    const response = await get<ApiResponse<OrderFeedback[]>>(`/api/orders/feedback/${orderId}`);
    return response.data.map((item) => OrderFeedbackSchema.parse(item));
}

export async function getProductFeedbacks(params: ProductFeedbackParams): Promise<PaginatedResponse<OrderFeedback>> {
    const response = await get<PaginatedResponse<OrderFeedback>>(`/api/orders/feedback/product/${params.productId}`, {
        params: {
            page: params.page,
            size: params.size,
            sortBy: params.sortBy,
            sortDirection: params.sortDirection,
        },
    });

    return {
        ...response,
        data: response.data.map((item) => OrderFeedbackSchema.parse(item)),
    };
}

export async function cancelOrder(payload: CancelOrderRequest): Promise<void> {
    await post("/api/sagas/cancel-order", payload);
}

export async function receiveOrder(orderId: string): Promise<void> {
    await patch(`/api/orders/${orderId}/receive`);
}
