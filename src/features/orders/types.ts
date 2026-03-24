import { z } from "zod";

import { AddressSchema } from "@/features/checkout/types";

export const DeliveryStatusSchema = z.string().min(1);
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

export const PaymentMethodSchema = z.enum(["E_WALLET", "BANK_ACCOUNT", "COD"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const OrderItemResponseSchema = z.object({}).passthrough();
export type OrderItemResponse = z.infer<typeof OrderItemResponseSchema>;

export const OrderSchema = z.object({
    orderId: z.string(),
    orderDate: z.string(),
    totalAmount: z.number(),
    deliveryStatus: DeliveryStatusSchema,
    paymentMethod: z.string(),
    paymentAccountId: z.string(),
    addressId: z.string(),
    customerId: z.string(),
    updatedAt: z.string(),
    items: z.array(OrderItemResponseSchema),
});

export type Order = z.infer<typeof OrderSchema>;

export const OrderListParamsSchema = z.object({
    page: z.number().int().nonnegative().default(0),
    size: z.number().int().positive().default(20),
    status: DeliveryStatusSchema.optional(),
    sortBy: z.string().optional(),
    sortDir: z.enum(["ASC", "DESC"]).optional(),
});

export type OrderListParams = z.infer<typeof OrderListParamsSchema>;

export const PaginatedOrdersSchema = z.object({
    pageNumber: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    items: z.array(OrderSchema),
});

export type PaginatedOrders = z.infer<typeof PaginatedOrdersSchema>;

export const CheckoutPreviewRequestSchema = z.object({
    cartItemIds: z.array(z.string()).min(1),
    voucherCode: z.string().optional(),
});

export type CheckoutPreviewRequest = z.infer<typeof CheckoutPreviewRequestSchema>;

export const CheckoutPreviewResponseSchema = z.object({
    checkoutSessionId: z.string(),
    discountErrorMsg: z.string(),
    defaultAddress: AddressSchema,
    items: z.array(z.object({}).passthrough()),
    shippingFee: z.number(),
    shippingDiscount: z.number(),
    voucherDiscount: z.number(),
    subTotal: z.number(),
    totalPrice: z.number(),
    defaultPaymentMethods: z.record(z.string(), z.object({}).passthrough()),
});

export type CheckoutPreviewResponse = z.infer<typeof CheckoutPreviewResponseSchema>;

export const RecalculateCheckoutRequestSchema = z.object({
    checkoutSessionId: z.string(),
    voucherCode: z.string().optional(),
    addressId: z.string().optional(),
    note: z.string().optional(),
});

export type RecalculateCheckoutRequest = z.infer<typeof RecalculateCheckoutRequestSchema>;

export const CheckoutRecalculateResponseSchema = z.object({
    checkoutSessionId: z.string(),
    discountErrorMsg: z.string(),
    items: z.array(z.object({}).passthrough()),
    shippingFee: z.number(),
    shippingDiscount: z.number(),
    voucherDiscount: z.number(),
    subTotal: z.number(),
    totalPrice: z.number(),
    note: z.string(),
});

export type CheckoutRecalculateResponse = z.infer<typeof CheckoutRecalculateResponseSchema>;

export const ConfirmCheckoutRequestSchema = z.object({
    checkoutSessionId: z.string(),
    paymentMethod: PaymentMethodSchema,
    paymentAccountId: z.string().optional(),
});

export type ConfirmCheckoutRequest = z.infer<typeof ConfirmCheckoutRequestSchema>;

export const ShippingFeeResponseSchema = z.object({
    shippingFee: z.number().nonnegative(),
    shippingFeeDiscount: z.number().nonnegative(),
});

export type ShippingFeeResponse = z.infer<typeof ShippingFeeResponseSchema>;

export const SubmitFeedbackRequestSchema = z.object({
    orderId: z.string(),
    items: z.array(z.object({}).passthrough()).min(1),
});

export type SubmitFeedbackRequest = z.infer<typeof SubmitFeedbackRequestSchema>;
