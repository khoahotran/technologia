import { UnknownContractError } from "./errors";
import {
    CheckoutRecalculateResponseSchema,
    CheckoutPreviewResponseSchema,
    OrderSchema,
    ShippingFeeResponseSchema,
    type CheckoutPreviewRequest,
    type CheckoutPreviewResponse,
    type CheckoutRecalculateResponse,
    type ConfirmCheckoutRequest,
    type Order,
    type OrderListParams,
    type PaginatedOrders,
    type RecalculateCheckoutRequest,
    type ShippingFeeResponse,
    type SubmitFeedbackRequest,
} from "./types";

import { get, post } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

export async function getOrders(params?: OrderListParams): Promise<PaginatedOrders> {
    const endpoint = params?.status ? "/api/orders/by-delivery-status" : "/api/orders";
    const response = await get<PaginatedResponse<Order>>(endpoint, {
        params: {
            page: params?.page ?? 0,
            size: params?.size ?? 20,
            sortBy: params?.sortBy,
            sortDir: params?.sortDir,
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

export async function confirmCheckout(input: ConfirmCheckoutRequest): Promise<{ orderId: string }> {
    const response = await post<ApiResponse<string>>("/api/checkout/confirm", input);
    return { orderId: response.data };
}

export async function getShippingFee(province: string, subTotal: number): Promise<ShippingFeeResponse> {
    const response = await get<ShippingFeeResponse>("/api/shipping-fee", {
        params: { province, subTotal },
    });
    return ShippingFeeResponseSchema.parse(response);
}

export async function updateOrderStatus(_orderId: string, _deliveryStatus: Order["deliveryStatus"]): Promise<Order> {
    // UNKNOWN: The latest backend docs provided in this workspace do not document order status update endpoint.
    throw new UnknownContractError(
        "UNKNOWN: Order status update endpoint is missing from backend docs."
    );
}

export async function submitOrderFeedback(_payload: SubmitFeedbackRequest): Promise<Order> {
    // UNKNOWN: The latest backend docs provided in this workspace do not document feedback endpoint.
    throw new UnknownContractError(
        "UNKNOWN: Feedback endpoint contract is missing. Backend must provide request/response schema."
    );
}
