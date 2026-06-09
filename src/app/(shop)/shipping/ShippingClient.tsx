"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, ChevronDown, Landmark, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AppError } from "@/api/client";
import { AddPaymentAccountDialog } from "@/components/features/checkout/AddPaymentAccountDialog";
import { PaymentMethodList } from "@/components/features/checkout/PaymentMethodList";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/features/cart/hooks";
import {
    useAddresses,
    useCreatePaymentAccount,
    usePaymentAccounts,
    useSetDefaultPaymentAccount,
} from "@/features/checkout/hooks";
import type { Address } from "@/features/checkout/types";
import {
    useCheckoutPreview,
    useConfirmCheckout,
    useRecalculateCheckout,
} from "@/features/orders/hooks";
import type { CheckoutPreviewResponse, CheckoutRecalculateResponse } from "@/features/orders/types";
import { useLanguage } from "@/providers/language.provider";
import { useAuthStore } from "@/store/auth.store";
import { useOrderFlowStore } from "@/store/order-flow.store";
import { toErrorMessage } from "@/utils/error-message";

function getAddressDisplay(address: Address) {
    return `${address.no} ${address.street}, ${address.ward}, ${address.city}, ${address.province}`;
}

export default function ShippingClient() {
    const { t, locale } = useLanguage();
    const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedQuery = searchParams.get("items");
    const voucherCodeParam = searchParams.get("voucherCode") || "";
    const addressId = searchParams.get("addressId");

    const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK_ACCOUNT" | "E_WALLET">("COD");
    const [paymentAccountId, setPaymentAccountId] = useState("");
    const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
    const [checkoutData, setCheckoutData] = useState<CheckoutPreviewResponse | CheckoutRecalculateResponse | null>(null);
    const lastRecalculatedRef = useRef<string | null>(null);

    const { data: addresses = [] } = useAddresses();
    const { data: paymentAccounts = [], refetch: refetchPaymentAccounts } = usePaymentAccounts();
    const createPaymentAccount = useCreatePaymentAccount();
    const setDefaultPaymentAccount = useSetDefaultPaymentAccount();
    const { cart, isLoading: isLoadingCart, isError, error: cartError, refetch } = useCart();
    const { session } = useAuthStore();
    const customerId = session?.user.userId;
    const checkoutPreview = useCheckoutPreview();
    const recalculateCheckout = useRecalculateCheckout();
    const confirmCheckout = useConfirmCheckout();
    const checkoutSessionId = useOrderFlowStore((state) => state.checkoutSessionId);
    const setCheckoutSessionId = useOrderFlowStore((state) => state.setCheckoutSessionId);
    const setSelectedCartItemIds = useOrderFlowStore((state) => state.setSelectedCartItemIds);
    const setSelectedAddressId = useOrderFlowStore((state) => state.setSelectedAddressId);
    const clearCheckoutFlow = useOrderFlowStore((state) => state.clearCheckoutFlow);

    const selectedIds = useMemo(
        () => (selectedQuery ? selectedQuery.split(",").filter(Boolean) : []),
        [selectedQuery]
    );

    // Always reset checkoutSessionId on mount so every visit to /shipping
    // triggers a fresh /checkout/preview/init call.
    // This fixes the bug where backing out of checkout without placing an order
    // caused the old session to be reused on the next checkout attempt.
    useEffect(() => {
        setCheckoutSessionId(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            const found = addresses.find((address) => address.addressId === addressId);
            if (found) return found;
        }
        return addresses.find((address) => address.isDefault);
    }, [addressId, addresses]);

    // Initial Preview
    useEffect(() => {
        if (selectedCartItems.length > 0 && !checkoutSessionId && !checkoutPreview.isPending) {
            checkoutPreview.mutate({
                cartItemIds: selectedCartItems.map(item => item.cartItemId),
                voucherCode: voucherCodeParam,
            }, {
                onSuccess: (data) => {
                    setCheckoutSessionId(data.checkoutSessionId);
                    setCheckoutData(data);
                }
            });
        }
    }, [selectedCartItems, checkoutSessionId, voucherCodeParam]);

    // Auto-Recalculate whenever address or voucher changes
    useEffect(() => {
        const recalculateKey = `${checkoutSessionId}-${activeAddress?.addressId}-${voucherCodeParam}`;
        if (checkoutSessionId && activeAddress && lastRecalculatedRef.current !== recalculateKey) {
            lastRecalculatedRef.current = recalculateKey;
            recalculateCheckout.mutate({
                checkoutSessionId,
                addressId: activeAddress.addressId,
                voucherCode: voucherCodeParam,
            }, {
                onSuccess: (data) => {
                    setCheckoutData(data);
                }
            });
        }
    }, [activeAddress, voucherCodeParam, checkoutSessionId]);


    const subtotal = checkoutData?.subTotal ?? 0;
    const shipping = checkoutData?.shippingFee ?? 0;
    const discount = (checkoutData?.voucherDiscount ?? 0) + (checkoutData?.shippingDiscount ?? 0);
    const total = checkoutData?.totalPrice ?? (subtotal + shipping - discount);

    const bankAccounts = useMemo(
        () =>
            paymentAccounts
                .filter((account) => account.type === "BANK_ACCOUNT")
                .map((account) => ({
                    id: account.paymentAccountId,
                    type: "bank" as const,
                    name: account.bankName,
                    accountName: account.holderName,
                    accountNumber: account.accountNumber,
                    isDefault: account.isDefault,
                })),
        [paymentAccounts]
    );

    const walletAccounts = useMemo(
        () =>
            paymentAccounts
                .filter((account) => account.type === "E_WALLET")
                .map((account) => ({
                    id: account.paymentAccountId,
                    type: "wallet" as const,
                    name: account.bankName,
                    accountName: account.holderName,
                    accountNumber: account.accountNumber,
                    isDefault: account.isDefault,
                })),
        [paymentAccounts]
    );

    const unsupportedPaymentAccountTypes = useMemo(
        () =>
            Array.from(
                new Set(
                    paymentAccounts
                        .map((account) => account.type)
                        .filter((type) => type !== "BANK_ACCOUNT" && type !== "E_WALLET")
                )
            ),
        [paymentAccounts]
    );

    const queryClient = useQueryClient();

    const executeOrder = async () => {
        try {
            let sessionId = checkoutSessionId;

            if (!sessionId) {
                const preview = await checkoutPreview.mutateAsync({
                    cartItemIds: selectedCartItems.map((item) => item.cartItemId),
                    voucherCode: voucherCodeParam,
                });
                sessionId = preview.checkoutSessionId;
                setCheckoutSessionId(sessionId);
            }

            await recalculateCheckout.mutateAsync({
                checkoutSessionId: sessionId,
                addressId: activeAddress!.addressId,
                voucherCode: voucherCodeParam,
            });

            const sagaId = await confirmCheckout.mutateAsync({
                checkoutSessionId: sessionId!,
                paymentMethod,
                paymentAccountId: paymentMethod === "COD" ? undefined : paymentAccountId,
            });

            queryClient.refetchQueries({ queryKey: ["cart"] });

            clearCheckoutFlow();
            router.push(`/order-processing?sagaId=${sagaId}&paymentMethod=${paymentMethod}`);

        } catch (error) {
            setCheckoutSessionId(null);
            toast.error(toErrorMessage(error, t('unable_place_order', {}, "Unable to place order")));
        }
    };

    const handlePlaceOrder = async () => {
        if (!activeAddress) {
            toast.error(t('select_address_first', {}, "Please create/select a shipping address first"));
            return;
        }
        if (selectedCartItems.length === 0) {
            toast.error(t('no_items_selected', {}, "No cart items selected"));
            return;
        }
        if (paymentMethod !== "COD" && !paymentAccountId) {
            toast.error(t('select_payment_account_first', {}, "Please select a payment account first"));
            return;
        }

        setSelectedCartItemIds(selectedCartItems.map((item) => item.cartItemId));
        setSelectedAddressId(activeAddress.addressId);

        await executeOrder();
    };

    if (isLoadingCart || checkoutPreview.isPending) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">{t('loading_checkout', {}, "Loading checkout...")}</p>
            </div>
        );
    }

    if (isError) {
        if (
            cartError instanceof AppError &&
            cartError.statusCode === 404
        ) {
            router.push("/cart");
            return null;
        }

        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-card p-6 rounded-lg border border-border text-center max-w-md">
                    <p className="text-red-500 font-medium">{t('cannot_load_checkout', {}, "Cannot load checkout data from backend.")}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {t('login_to_view_cart', {}, "Please login first or check cart service connection.")}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-4 min-h-11 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground"
                    >
                        {t('retry', {}, "Retry")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <Link href="/cart" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-medium">{t('back_to_cart', {}, "Back to cart")}</span>
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('shipping_detail', {}, "Shipping Detail")}</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <PaymentMethodList
                            type="bank"
                            methods={bankAccounts}
                            onUse={(id) => {
                                setPaymentMethod("BANK_ACCOUNT");
                                setPaymentAccountId(id);
                            }}
                            onSetDefault={(id) => setDefaultPaymentAccount.mutate(id)}
                            onAddNew={() => setShowAddPaymentDialog(true)}
                        />
                        <PaymentMethodList
                            type="wallet"
                            methods={walletAccounts}
                            onUse={(id) => {
                                setPaymentMethod("E_WALLET");
                                setPaymentAccountId(id);
                            }}
                            onSetDefault={(id) => setDefaultPaymentAccount.mutate(id)}
                            onAddNew={() => setShowAddPaymentDialog(true)}
                        />
                        {unsupportedPaymentAccountTypes.length > 0 && (
                            <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                                {t(
                                    'unknown_payment_account_types',
                                    {},
                                    'UNKNOWN payment account type(s):'
                                )}{" "}
                                {unsupportedPaymentAccountTypes.join(", ")}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card p-5 sm:p-6 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900">{t('address', {}, "Address")}</h2>
                                <Link
                                    href="/address-book"
                                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-10"
                                >
                                    {t('choose_other_address', {}, "Choose other address")}
                                    <ChevronDown className="h-4 w-4" />
                                </Link>
                            </div>
                            {activeAddress ? (
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-500">{t('customer_name', {}, "Customer name")}</p>
                                    <p className="font-medium text-gray-900">{activeAddress.receiverName}</p>
                                    <p className="text-gray-500">{t('customer_phone', {}, "Customer phone number")}</p>
                                    <p className="font-medium text-gray-900">{activeAddress.receiverPhoneNumber}</p>
                                    <p className="text-gray-500">{t('customer_address', {}, "Customer address")}</p>
                                    <p className="font-medium text-gray-900">{getAddressDisplay(activeAddress)}</p>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    {t('no_address_found', {}, "No address found.")} <Link href="/address-book/new" className="text-primary">{t('create_one_now', {}, "Create one now")}</Link>.
                                </div>
                            )}
                        </div>

                        <div className="bg-card p-5 sm:p-6 rounded-lg border border-border">
                            <h2 className="font-bold text-gray-900 mb-4">{t('my_order', {}, "My order")}</h2>

                            <div className="space-y-3 mb-6">
                                {selectedCartItems.map((item) => (
                                    <div key={item.cartItemId} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.currentQuantity}x</span>
                                        <span className="flex-1 ml-4 text-gray-900">{item.name}</span>
                                        <span className="font-medium text-primary">
                                            {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(item.priceAfterDiscount ?? item.price ?? 0) }, `${new Intl.NumberFormat(currentLocale).format(item.priceAfterDiscount ?? item.price ?? 0)} VND`)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('sub_total', {}, "Sub-total")}</span>
                                    <span className="font-medium text-gray-900">
                                        {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(subtotal) }, `${new Intl.NumberFormat(currentLocale).format(subtotal)} VND`)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('shipping', {}, "Shipping")}</span>
                                    <span className="font-medium text-gray-900">
                                        {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(shipping) }, `${new Intl.NumberFormat(currentLocale).format(shipping)} VND`)}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>{t('discount', {}, "Discount")}</span>
                                        <span>
                                            -{t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(discount) }, `${new Intl.NumberFormat(currentLocale).format(discount)} VND`)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                                    <span className="text-gray-900">{t('order_total', {}, "Order total")}</span>
                                    <span className="text-primary">
                                        {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(total) }, `${new Intl.NumberFormat(currentLocale).format(total)} VND`)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-5 sm:p-6 rounded-lg border border-border">
                            <h2 className="font-bold text-gray-900 mb-4">{t('payment', {}, "Payment Method")}</h2>

                            <RadioGroup
                                value={paymentMethod}
                                onValueChange={(value) => {
                                    const nextValue = value as "BANK_ACCOUNT" | "E_WALLET" | "COD";
                                    setPaymentMethod(nextValue);
                                    if (nextValue === "COD") {
                                        setPaymentAccountId("");
                                        return;
                                    }
                                    if (nextValue === "BANK_ACCOUNT") {
                                        setPaymentAccountId(bankAccounts[0]?.id ?? "");
                                        return;
                                    }
                                    setPaymentAccountId(walletAccounts[0]?.id ?? "");
                                }}
                                className="grid gap-3"
                            >
                                <div
                                    className={`relative flex items-center gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${paymentMethod === "BANK_ACCOUNT"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/30"
                                        }`}
                                    onClick={() => {
                                        setPaymentMethod("BANK_ACCOUNT");
                                        setPaymentAccountId(bankAccounts[0]?.id ?? "");
                                    }}
                                >
                                    <RadioGroupItem value="BANK_ACCOUNT" id="bank" />
                                    <Landmark className={`h-5 w-5 ${paymentMethod === "BANK_ACCOUNT" ? "text-primary" : "text-muted-foreground"}`} />
                                    <Label htmlFor="bank" className="font-medium text-gray-900 cursor-pointer flex-1">
                                        {t('direct_bank_transfer', {}, "Direct bank transfer")}
                                    </Label>
                                </div>

                                <div
                                    className={`relative flex items-center gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${paymentMethod === "E_WALLET"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/30"
                                        }`}
                                    onClick={() => {
                                        setPaymentMethod("E_WALLET");
                                        setPaymentAccountId(walletAccounts[0]?.id ?? "");
                                    }}
                                >
                                    <RadioGroupItem value="E_WALLET" id="wallet" />
                                    <Wallet className={`h-5 w-5 ${paymentMethod === "E_WALLET" ? "text-primary" : "text-muted-foreground"}`} />
                                    <Label htmlFor="wallet" className="font-medium text-gray-900 cursor-pointer flex-1">
                                        {t('e_wallet', {}, "E-wallet")}
                                    </Label>
                                </div>

                                <div
                                    className={`relative flex items-center gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${paymentMethod === "COD"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/30"
                                        }`}
                                    onClick={() => {
                                        setPaymentMethod("COD");
                                        setPaymentAccountId("");
                                    }}
                                >
                                    <RadioGroupItem value="COD" id="cod" />
                                    <Banknote className={`h-5 w-5 ${paymentMethod === "COD" ? "text-primary" : "text-muted-foreground"}`} />
                                    <Label htmlFor="cod" className="font-medium text-gray-900 cursor-pointer flex-1">
                                        {t('cash_on_delivery', {}, "Cash on delivery")}
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={checkoutPreview.isPending || recalculateCheckout.isPending || confirmCheckout.isPending}
                                className="w-full sm:w-64 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-base"
                            >
                                {t('place_order', {}, "Place order")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <AddPaymentAccountDialog
                open={showAddPaymentDialog}
                onOpenChange={setShowAddPaymentDialog}
                onConfirm={(data) => {
                    createPaymentAccount.mutate(data, {
                        onSuccess: () => {
                            setShowAddPaymentDialog(false);
                            refetchPaymentAccounts();
                        },
                    });
                }}
                isPending={createPaymentAccount.isPending}
            />
        </div>
    );
}
