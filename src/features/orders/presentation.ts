import type { DeliveryStatus, Order } from "./types";

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
    "AWAITING_PAYMENT",
    "AWAITING_CONFIRM",
    "PENDING",
    "ON_SHIPPING",
    "DELIVERED",
    "RECEIVED",
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
    return status === "DELIVERED";
}

export function canGiveFeedback(order: Order) {
    return order.deliveryStatus === "RECEIVED";
}

export function formatOrderStatusLabel(status: DeliveryStatus | string, t?: Translator) {
    switch (status) {
        case "AWAITING_PAYMENT":
            return t ? t("order_status_awaiting_payment", {}, "Awaiting Payment") : "Awaiting Payment";
        case "AWAITING_CONFIRM":
            return t ? t("order_status_awaiting_confirm", {}, "Awaiting Confirmation") : "Awaiting Confirmation";
        case "PENDING":
            return t ? t("order_status_pending", {}, "Pending") : "Pending";
        case "ON_SHIPPING":
            return t ? t("order_status_shipping") : "Shipping";
        case "DELIVERED":
            return t ? t("order_status_delivered") : "Delivered";
        case "RECEIVED":
            return t ? t("order_status_received") : "Received";
        case "CANCELED":
            return t ? t("order_status_cancelled") : "Cancelled";
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

export function formatDeliveryLogStatusLabel(status: string | number, t?: Translator) {
    const s = String(status);
    switch (s) {
        case "PENDING":
        case "0":
            return t ? t("order_status_pending", {}, "Pending") : "Pending";
        case "COMPLETED":
        case "1":
            return t ? t("delivery_log_completed", {}, "Completed") : "Completed";
        case "FAILED":
        case "2":
            return t ? t("delivery_log_failed", {}, "Failed") : "Failed";
        case "COMPENSATING":
        case "3":
            return t ? t("delivery_log_compensating", {}, "Compensating") : "Compensating";
        case "COMPENSATED":
        case "4":
            return t ? t("delivery_log_compensated", {}, "Compensated") : "Compensated";
        case "ON_SHIPPING":
            return t ? t("order_status_shipping", {}, "Shipping") : "Shipping";
        case "DELIVERED":
            return t ? t("order_status_delivered", {}, "Delivered") : "Delivered";
        default:
            return s;
    }
}

export function formatCurrencyVnd(value: number, locale: string) {
    return `${new Intl.NumberFormat(locale).format(value)} VND`;
}

export function truncateId(id: string, visibleChars = 8): string {
    if (!id) return "";
    return id.length > visibleChars ? `${id.slice(0, 4)}...${id.slice(-visibleChars)}` : id;
}

// end user transitions and not admin updates
export const VALID_STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
    AWAITING_PAYMENT: ["AWAITING_CONFIRM", "CANCELED"],
    AWAITING_CONFIRM: ["PENDING", "CANCELED"],
    PENDING: ["ON_SHIPPING", "CANCELED"],
    ON_SHIPPING: ["DELIVERED"],
    DELIVERED: ["RECEIVED"],
    RECEIVED: [],
    CANCELED: [],
};

export function getNextStatusOptions(currentStatus: DeliveryStatus): DeliveryStatus[] {
    return VALID_STATUS_TRANSITIONS[currentStatus] || [];
}

