import type { DeliveryStatus, Order } from "./types";

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
    "AWAITING_PAYMENT",
    "AWAITING_CONFIRM",
    "PENDING",
    "ON_SHIPPING",
    "DELIVERED",
    "CANCELED",
];

type Translator = (key: string, replacements?: Record<string, string | number>, defaultValue?: string) => string;

export function isCreatedOrder(status: DeliveryStatus) {
    return status === "AWAITING_PAYMENT" || status === "AWAITING_CONFIRM" || status === "PENDING";
}

export function canCancelOrder(status: DeliveryStatus) {
    return status === "AWAITING_PAYMENT" || status === "PENDING" || status === "AWAITING_CONFIRM";
}

export function canConfirmOrderReceived(status: DeliveryStatus) {
    return status === "ON_SHIPPING";
}

export function canGiveFeedback(order: Order) {
    return order.deliveryStatus === "DELIVERED";
}

export function formatOrderStatusLabel(status: DeliveryStatus, t?: Translator) {
    switch (status) {
        case "AWAITING_PAYMENT":
            return t ? t("order_status_awaiting_payment", {}, "Awaiting Payment") : "Awaiting Payment";
        case "AWAITING_CONFIRM":
            return t ? t("order_status_awaiting_confirm", {}, "Awaiting Confirmation") : "Awaiting Confirmation";
        case "PENDING":
            return t ? t("order_status_pending", {}, "Pending") : "Pending";
        case "ON_SHIPPING":
            return t ? t("order_status_shipping", {}, "Shipping") : "Shipping";
        case "DELIVERED":
            return t ? t("order_status_delivered", {}, "Delivered") : "Delivered";
        case "CANCELED":
            return t ? t("order_status_cancelled", {}, "Cancelled") : "Cancelled";
        default:
            return status;
    }
}

export function formatPaymentMethodLabel(paymentMethod: Order["paymentMethod"], t?: Translator) {
    if (paymentMethod === "BANK_ACCOUNT") {
        return t ? t("payment_method_bank_account", {}, "Direct bank transfer") : "Direct bank transfer";
    }
    if (paymentMethod === "E_WALLET") return t ? t("payment_method_e_wallet", {}, "E-wallet") : "E-wallet";
    return t ? t("payment_method_cod", {}, "Cash on delivery") : "Cash on delivery";
}

export function formatDeliveryLogStatusLabel(status: string, t?: Translator) {
    switch (status) {
        case "PENDING":
            return t ? t("order_status_pending", {}, "Pending") : "Pending";
        case "COMPLETED":
            return t ? t("delivery_log_completed", {}, "Completed") : "Completed";
        case "COMPENSATING":
            return t ? t("delivery_log_compensating", {}, "Compensating") : "Compensating";
        case "COMPENSATED":
            return t ? t("delivery_log_compensated", {}, "Compensated") : "Compensated";
        case "FAILED":
            return t ? t("delivery_log_failed", {}, "Failed") : "Failed";
        default:
            return status;
    }
}

export function formatCurrencyVnd(value: number, locale: string) {
    return `${new Intl.NumberFormat(locale).format(value)} VND`;
}
