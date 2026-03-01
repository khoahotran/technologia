export interface CheckoutAddress {
    id: string;
    fullName: string;
    phone: string;
    line: string;
    ward: string;
    city: string;
    province: string;
    note?: string;
    isDefault: boolean;
}

export interface CheckoutOrderItem {
    cartItemId: string;
    productId: string;
    variantId?: string;
    name: string;
    image?: string;
    quantity: number;
    unitPrice: number;
}

export interface CheckoutOrder {
    id: string;
    createdAt: string;
    status: "created" | "shipping" | "delivered" | "cancelled";
    paymentMethod: "bank" | "wallet" | "cod";
    shippingAddress: CheckoutAddress;
    items: CheckoutOrderItem[];
    total: number;
}

const ADDRESS_KEY = "checkout_addresses";
const ORDER_KEY = "checkout_orders";

function isBrowser() {
    return typeof window !== "undefined";
}

const DEFAULT_ADDRESSES: CheckoutAddress[] = [
    {
        id: "addr-default-1",
        fullName: "Nguyen Van A",
        phone: "0900000001",
        line: "123 Le Loi",
        ward: "Ben Nghe",
        city: "Quan 1",
        province: "TP.HCM",
        note: "Giao gio hanh chinh",
        isDefault: true,
    },
];

export function getCheckoutAddresses(): CheckoutAddress[] {
    if (!isBrowser()) return DEFAULT_ADDRESSES;
    const raw = localStorage.getItem(ADDRESS_KEY);
    if (!raw) return DEFAULT_ADDRESSES;
    try {
        const parsed = JSON.parse(raw) as CheckoutAddress[];
        return parsed.length ? parsed : DEFAULT_ADDRESSES;
    } catch {
        return DEFAULT_ADDRESSES;
    }
}

export function saveCheckoutAddresses(addresses: CheckoutAddress[]) {
    if (!isBrowser()) return;
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(addresses));
}

export function addCheckoutAddress(
    input: Omit<CheckoutAddress, "id" | "isDefault"> & { isDefault?: boolean }
): CheckoutAddress[] {
    const current = getCheckoutAddresses();
    const shouldDefault = input.isDefault || current.length === 0;
    const next = current.map((a) => ({ ...a, isDefault: shouldDefault ? false : a.isDefault }));
    next.push({
        ...input,
        id: crypto.randomUUID(),
        isDefault: shouldDefault,
    });
    saveCheckoutAddresses(next);
    return next;
}

export function setDefaultCheckoutAddress(id: string): CheckoutAddress[] {
    const next = getCheckoutAddresses().map((address) => ({
        ...address,
        isDefault: address.id === id,
    }));
    saveCheckoutAddresses(next);
    return next;
}

export function getDefaultCheckoutAddress(): CheckoutAddress | undefined {
    return getCheckoutAddresses().find((address) => address.isDefault);
}

export function getCheckoutOrders(): CheckoutOrder[] {
    if (!isBrowser()) return [];
    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as CheckoutOrder[];
    } catch {
        return [];
    }
}

export function saveCheckoutOrders(orders: CheckoutOrder[]) {
    if (!isBrowser()) return;
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

export function addCheckoutOrder(order: Omit<CheckoutOrder, "id" | "createdAt">): CheckoutOrder[] {
    const current = getCheckoutOrders();
    const nextOrder: CheckoutOrder = {
        ...order,
        id: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    const next = [nextOrder, ...current];
    saveCheckoutOrders(next);
    return next;
}
