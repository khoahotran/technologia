import type { DeliveryStatus, Order } from "./types";

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
    "PENDING",
    "SHIPPING",
    "DELIVERED",
    "CANCELLED",
];

export function isCreatedOrder(status: DeliveryStatus) {
    return status === "PENDING" || status === "AWAITING_CONFIRM";
}

export function canCancelOrder(status: DeliveryStatus) {
    return status === "PENDING" || status === "AWAITING_CONFIRM";
}

export function canConfirmOrderReceived(status: DeliveryStatus) {
    return status === "SHIPPING";
}

export function canGiveFeedback(order: Order) {
    return order.deliveryStatus === "DELIVERED";
}

export function formatOrderStatusLabel(status: DeliveryStatus) {
    switch (status) {
        case "PENDING":
            return "Pending";
        case "SHIPPING":
            return "Shipping";
        case "DELIVERED":
            return "Delivered";
        case "CANCELLED":
            return "Cancelled";
        default:
            return status;
    }
}

export function formatPaymentMethodLabel(paymentMethod: Order["paymentMethod"]) {
    if (paymentMethod === "BANK_ACCOUNT") return "Direct bank transfer";
    if (paymentMethod === "E_WALLET") return "E-wallet";
    return "Cash on delivery";
}

export function formatCurrencyVnd(value: number, locale: string) {
    return `${new Intl.NumberFormat(locale).format(value)} VND`;
}
