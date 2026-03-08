"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PaymentMethodList } from "@/components/features/checkout/PaymentMethodList";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { isAppError } from "@/domain/errors";
import {
    addCheckoutOrder,
    getCheckoutAddresses,
    type CheckoutAddress,
    type CheckoutOrderItem,
} from "@/lib/checkout-flow";
import {
    useCartPriceMutation,
    useCartQuery,
    useRemoveCartItemMutation,
} from "@/presentation/hooks";
import { useLanguage } from "@/shared/providers/language.provider";

/**
 * Hàm hỗ trợ định dạng địa chỉ thành chuỗi dễ đọc.
 * 
 * @param address - Thông tin địa chỉ giao hàng
 * @returns Chuỗi địa chỉ đã được kết hợp
 */
function getAddressDisplay(address: CheckoutAddress) {
    return `${address.line}, ${address.ward}, ${address.city}, ${address.province}`;
}

/**
 * Giao diện Thanh toán & Vận chuyển (Shipping & Checkout Client)
 * 
 * Hiển thị màn hình cho phép người dùng:
 * - Chọn địa chỉ giao hàng.
 * - Xem lại danh sách sản phẩm chuẩn bị thanh toán.
 * - Chọn phương thức thanh toán.
 * - Thực hiện đặt hàng và điều hướng tới trang kết quả.
 */
export default function ShippingClient() {
    const { t, locale } = useLanguage();
    const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedQuery = searchParams.get("items");
    const addressId = searchParams.get("addressId");

    const [paymentMethod, setPaymentMethod] = useState<"bank" | "wallet" | "cod">("bank");
    const [addresses] = useState<CheckoutAddress[]>(() => getCheckoutAddresses());
    const { data: cart, isLoading, isError, error: cartError, refetch } = useCartQuery();
    const removeMutation = useRemoveCartItemMutation();
    const { mutate: calculatePrice, data: calculatedPrice } = useCartPriceMutation();

    const selectedIds = useMemo(
        () => (selectedQuery ? selectedQuery.split(",").filter(Boolean) : []),
        [selectedQuery]
    );

    const allCartItems = useMemo(() => cart?.cartItems ?? [], [cart]);
    const selectedCartItems = useMemo(
        () =>
            selectedIds.length
                ? allCartItems.filter((item) => selectedIds.includes(item.cartItemId))
                : allCartItems,
        [allCartItems, selectedIds]
    );

    const activeAddress = useMemo(() => {
        if (addressId) {
            const found = addresses.find((address) => address.id === addressId);
            if (found) return found;
        }
        return addresses.find((address) => address.isDefault);
    }, [addressId, addresses]);

    const localSubtotal = useMemo(
        () =>
            selectedCartItems.reduce(
                (sum, item) =>
                    sum + (item.priceAfterDiscount ?? item.price ?? 0) * item.currentQuantity,
                0
            ),
        [selectedCartItems]
    );

    useEffect(() => {
        const cartItemIds = selectedCartItems.map((item) => item.cartItemId);
        if (cartItemIds.length === 0) return;
        calculatePrice({
            includeDiscount: false,
            cartItemIds,
        });
    }, [selectedCartItems, calculatePrice]);

    const subtotal = calculatedPrice ?? localSubtotal;
    const shipping = 0;
    const total = subtotal + shipping;

    const bankAccounts = [
        { id: "1", type: "bank" as const, name: "Vietcombank", accountName: "SHOP ACCOUNT", accountNumber: "1234567890", isDefault: true },
        { id: "2", type: "bank" as const, name: "Techcombank", accountName: "SHOP ACCOUNT", accountNumber: "9876543210" },
    ];
    const walletAccounts = [
        { id: "1", type: "wallet" as const, name: "MoMo", accountName: "SHOP WALLET", accountNumber: "0900000000", isDefault: true },
        { id: "2", type: "wallet" as const, name: "ZaloPay", accountName: "SHOP WALLET", accountNumber: "0911111111" },
    ];

    const handlePlaceOrder = async () => {
        if (!activeAddress) {
            toast.error(t('select_address_first', {}, "Please create/select a shipping address first"));
            return;
        }
        if (selectedCartItems.length === 0) {
            toast.error(t('no_items_selected', {}, "No cart items selected"));
            return;
        }

        const orderItems: CheckoutOrderItem[] = selectedCartItems.map((item) => ({
            cartItemId: item.cartItemId,
            productId: item.productId,
            variantId: item.variantId || "",
            name: item.name,
            image: item.mainImage || "/placeholder.png",
            quantity: item.currentQuantity,
            unitPrice: item.priceAfterDiscount ?? item.price ?? 0,
        }));

        addCheckoutOrder({
            status: "created",
            paymentMethod,
            shippingAddress: activeAddress,
            items: orderItems,
            total,
        });

        await Promise.all(
            selectedCartItems.map(
                (item) =>
                    new Promise<void>((resolve) => {
                        removeMutation.mutate(item.cartItemId, {
                            onSettled: () => resolve(),
                        });
                    })
            )
        );

        toast.success(t('order_placed_success', {}, "Order placed successfully"));
        router.push("/orders");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9F8FE] flex items-center justify-center">
                <p className="text-gray-500">{t('loading_checkout', {}, "Loading checkout...")}</p>
            </div>
        );
    }

    if (isError) {
        // if the cart query threw a 404, the user probably has no cart, redirect to cart page
        if (
            isAppError(cartError) &&
            cartError.statusCode === 404
        ) {
            router.push("/cart");
            return null;
        }

        return (
            <div className="min-h-screen bg-[#F9F8FE] flex items-center justify-center px-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 text-center max-w-md">
                    <p className="text-red-500 font-medium">{t('cannot_load_checkout', {}, "Cannot load checkout data from backend.")}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {t('login_to_view_cart', {}, "Please login first or check cart service connection.")}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 rounded-lg bg-[#8AB0C3] text-white"
                    >
                        {t('retry', {}, "Retry")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            <div className="container mx-auto px-4 py-8">
                <Link href="/cart" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-medium">{t('back_to_cart', {}, "Back to cart")}</span>
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('shipping_detail', {}, "Shipping Detail")}</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <PaymentMethodList type="bank" methods={bankAccounts} />
                        <PaymentMethodList type="wallet" methods={walletAccounts} />
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900">{t('address', {}, "Address")}</h2>
                                <Link
                                    href="/address-book"
                                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                    {t('choose_other_address', {}, "Choose other address")}
                                    <ChevronDown className="h-4 w-4" />
                                </Link>
                            </div>
                            {activeAddress ? (
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-500">{t('customer_name', {}, "Customer name")}</p>
                                    <p className="font-medium text-gray-900">{activeAddress.fullName}</p>
                                    <p className="text-gray-500">{t('customer_phone', {}, "Customer phone number")}</p>
                                    <p className="font-medium text-gray-900">{activeAddress.phone}</p>
                                    <p className="text-gray-500">{t('customer_address', {}, "Customer address")}</p>
                                    <p className="font-medium text-gray-900">{getAddressDisplay(activeAddress)}</p>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    {t('no_address_found', {}, "No address found.")} <Link href="/address-book/new" className="text-[#3E93B3]">{t('create_one_now', {}, "Create one now")}</Link>.
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <h2 className="font-bold text-gray-900 mb-4">{t('my_order', {}, "My order")}</h2>

                            <div className="space-y-3 mb-6">
                                {selectedCartItems.map((item) => (
                                    <div key={item.cartItemId} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.currentQuantity}x</span>
                                        <span className="flex-1 ml-4 text-gray-900">{item.name}</span>
                                        <span className="font-medium text-[#3E93B3]">
                                            {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(item.priceAfterDiscount ?? item.price ?? 0) }, `${new Intl.NumberFormat(currentLocale).format(item.priceAfterDiscount ?? item.price ?? 0)} VND`)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('sub_total', {}, "Sub-total")}</span>
                                    <span className="font-medium text-gray-900">
                                        {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(subtotal) }, `${new Intl.NumberFormat(currentLocale).format(subtotal)} VND`)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('shipping', {}, "Shipping")}</span>
                                    <span className="font-medium text-green-500">{t('free_shipping', {}, "Free Shipping")}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                                    <span className="text-gray-900">{t('order_total', {}, "Order total")}</span>
                                    <span className="text-[#3E93B3]">
                                        {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(total) }, `${new Intl.NumberFormat(currentLocale).format(total)} VND`)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <h2 className="font-bold text-gray-900 mb-4">{t('payment', {}, "Payment")}</h2>

                            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "bank" | "wallet" | "cod")} className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="bank" id="bank" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="bank" className="font-medium text-gray-900 cursor-pointer">
                                            {t('direct_bank_transfer', {}, "Direct bank transfer")}
                                        </Label>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="wallet" className="font-medium text-gray-900 cursor-pointer">
                                            {t('e_wallet', {}, "E-wallet")}
                                        </Label>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="cod" className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                                            <Checkbox checked={paymentMethod === "cod"} className="pointer-events-none" />
                                            {t('cash_on_delivery', {}, "Cash on delivery")}
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                type="button"
                                onClick={handlePlaceOrder}
                                className="w-64 h-12 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold text-base"
                            >
                                {t('place_order', {}, "Place order")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
