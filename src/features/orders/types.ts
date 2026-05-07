import { z } from "zod";

import { AddressSchema } from "@/features/checkout/types";

export const DeliveryStatusSchema = z.enum([
    "AWAITING_PAYMENT",
    "AWAITING_CONFIRM",
    "PENDING",
    "ON_SHIPPING",
    "DELIVERED",
    "CANCELED",
]);
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

export const AdminUpdateOrderStatusSchema = z.enum([
    "PENDING",
    "ON_SHIPPING",
    "DELIVERED",
    "CANCELED",
]);
export type AdminUpdateOrderStatus = z.infer<typeof AdminUpdateOrderStatusSchema>;

export const PaymentMethodSchema = z.enum(["E_WALLET", "BANK_ACCOUNT", "COD"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const OrderItemResponseSchema = z.object({}).passthrough();
export type OrderItemResponse = z.infer<typeof OrderItemResponseSchema>;

export const OrderSchema = z.object({
    orderId: z.string(),
    orderDate: z.string(),
    totalAmount: z.number(),
    deliveryStatus: DeliveryStatusSchema,
    paymentMethod: PaymentMethodSchema,
    paymentAccountId: z.string().nullable().optional(),
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
    sortDirection: z.enum(["ASC", "DESC"]).optional(),
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
    discountErrorMsg: z.string().nullable(),
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
    discountErrorMsg: z.string().nullable(),
    items: z.array(z.object({}).passthrough()),
    shippingFee: z.number(),
    shippingDiscount: z.number(),
    voucherDiscount: z.number(),
    subTotal: z.number(),
    totalPrice: z.number(),
    note: z.string().optional().nullable(),
});

export type CheckoutRecalculateResponse = z.infer<typeof CheckoutRecalculateResponseSchema>;

export const ConfirmCheckoutRequestSchema = z.object({
    checkoutSessionId: z.string(),
    paymentMethod: PaymentMethodSchema,
    paymentAccountId: z.string().optional(),
});

export type ConfirmCheckoutRequest = z.infer<typeof ConfirmCheckoutRequestSchema>;

export const CreatePaymentRequestSchema = z.object({
    orderId: z.string(),
    sagaId: z.string(),
    paymentMethod: PaymentMethodSchema,
});

export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;

export const SimulatePaymentRequestSchema = z.object({
    orderId: z.string(),
    paymentId: z.string(),
});

export type SimulatePaymentRequest = z.infer<typeof SimulatePaymentRequestSchema>;

export const ShippingFeeResponseSchema = z.object({
    shippingFee: z.number().nonnegative(),
    shippingFeeDiscount: z.number().nonnegative(),
});

export type ShippingFeeResponse = z.infer<typeof ShippingFeeResponseSchema>;

export const SubmitFeedbackRequestSchema = z.object({
    orderId: z.string(),
    items: z.array(z.object({
        orderItemId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(1),
    })).min(1),
});

export type SubmitFeedbackRequest = z.infer<typeof SubmitFeedbackRequestSchema>;

export const DeliveryLogSchema = z.object({
    deliveryLogId: z.string(),
    orderId: z.string(),
    status: z.string(),
    message: z.string(),
    createdAt: z.string(),
});

export type DeliveryLog = z.infer<typeof DeliveryLogSchema>;

export const OrderFeedbackSchema = z.object({
    orderItemId: z.string(),
    productId: z.string(),
    variantId: z.string(),
    rating: z.number().int().min(1).max(5),
    comment: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type OrderFeedback = z.infer<typeof OrderFeedbackSchema>;

export const ProductFeedbackParamsSchema = z.object({
    productId: z.string(),
    page: z.number().int().nonnegative().default(0),
    size: z.number().int().positive().default(10),
    sortBy: z.string().optional(),
    sortDirection: z.enum(["ASC", "DESC"]).optional(),
});

export type ProductFeedbackParams = z.infer<typeof ProductFeedbackParamsSchema>;
