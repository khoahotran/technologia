"use client";

import { Ticket, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CartItem } from "@/components/features/cart/CartItem";
import { CartSummary } from "@/components/features/cart/CartSummary";
import { Subscribe } from "@/components/features/home/Subscribe";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/features/cart/hooks";
import { useLanguage } from "@/providers/language.provider";
import { useOrderFlowStore } from "@/store/order-flow.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateCartPrice } from "@/features/cart/api";
import { getDiscountByCode } from "@/features/discounts/api";
import { DiscountResponse } from "@/features/discounts/types";
import { CountPriceResponse } from "@/features/cart/types";

export default function CartClient() {
    const { t } = useLanguage();
    const { cart, isLoading, isError, increase, decrease, remove } = useCart();

    const items = useMemo(() => cart?.cartItems ?? [], [cart]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [hasUserSelection, setHasUserSelection] = useState(false);
    const setSelectedCartItemIds = useOrderFlowStore((state) => state.setSelectedCartItemIds);
    const effectiveSelectedIds = useMemo(() => 
        hasUserSelection ? selectedIds : items.map((item) => item.cartItemId),
        [hasUserSelection, selectedIds, items]
    );

    // Discount state
    const [promoCode, setPromoCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountResponse | null>(null);
    const [priceResult, setPriceResult] = useState<CountPriceResponse | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Calculate real price whenever selection or discount changes
    useEffect(() => {
        if (effectiveSelectedIds.length === 0) {
            setPriceResult(null);
            return;
        }

        const fetchPrice = async () => {
            setIsCalculating(true);
            try {
                const result = await calculateCartPrice({
                    includeDiscount: !!appliedDiscount,
                    userDiscountId: appliedDiscount?.discountId || null,
                    cartItemIds: effectiveSelectedIds,
                });
                setPriceResult(result);
            } catch (error) {
                console.error("Failed to calculate price", error);
                // Fallback to client-side total if API fails
            } finally {
                setIsCalculating(false);
            }
        };

        fetchPrice();
    }, [effectiveSelectedIds, appliedDiscount]);

    const clientSideTotal = useMemo(
        () =>
            items
                .filter((item) => effectiveSelectedIds.includes(item.cartItemId))
                .reduce(
                    (sum, item) =>
                        sum + (item.priceAfterDiscount ?? item.price ?? 0) * item.currentQuantity,
                    0
                ),
        [items, effectiveSelectedIds]
    );

    const displayTotal = priceResult?.totalPrice ?? clientSideTotal;
    const displayDiscount = priceResult?.totalDiscount ?? 0;

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;

        setIsCalculating(true);
        try {
            const discount = await getDiscountByCode(promoCode.trim());
            if (discount) {
                setAppliedDiscount(discount);
                toast.success(t('promo_applied', { code: promoCode }, `Promo code ${promoCode} applied!`));
            } else {
                toast.error(t('promo_invalid', {}, "Invalid promo code"));
                setAppliedDiscount(null);
            }
        } catch (error) {
            toast.error(t('promo_error', {}, "Failed to verify promo code"));
        } finally {
            setIsCalculating(false);
        }
    };

    const toggleItem = (id: string) => {
        setHasUserSelection(true);
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const toggleAll = (checked: boolean) => {
        setHasUserSelection(true);
        setSelectedIds(checked ? items.map((item) => item.cartItemId) : []);
    };

    const allSelected = items.length > 0 && effectiveSelectedIds.length === items.length;

    useEffect(() => {
        setSelectedCartItemIds(effectiveSelectedIds);
    }, [effectiveSelectedIds, setSelectedCartItemIds]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">{t('loading_cart', {}, "Loading cart...")}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-card p-6 rounded-lg border border-border text-center max-w-md">
                    <p className="text-red-500 font-medium">{t('cannot_load_cart', {}, "Cannot load cart from backend.")}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {t('login_to_view_cart', {}, "Please login first or check cart service connection.")}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 min-h-11 rounded-lg bg-secondary text-secondary-foreground"
                    >
                        {t('retry', {}, "Retry")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="bg-card p-4 rounded-lg border border-border flex items-center justify-between gap-2">
                            <div className="flex items-center gap-4">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                                />
                                <span className="font-medium text-foreground">{t('select_all', {}, "Select All")}</span>
                            </div>
                            <button
                                type="button"
                                className="min-h-11 px-2 text-red-500 hover:text-red-600 font-medium"
                                onClick={() => {
                                    effectiveSelectedIds.forEach((id) => {
                                        remove(id);
                                    });
                                    toast.success(t('removed_selected', {}, "Removed selected items"));
                                }}
                            >
                                {t('remove', {}, "REMOVE")}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartItem
                                    key={item.cartItemId}
                                    id={item.cartItemId}
                                    title={item.name}
                                    price={item.priceAfterDiscount ?? item.price ?? 0}
                                    image={item.mainImage ?? "https://placehold.co/400x400/f3f4f6/f3f4f6"}
                                    quantity={item.currentQuantity}
                                    isSelected={effectiveSelectedIds.includes(item.cartItemId)}
                                    onToggle={() => toggleItem(item.cartItemId)}
                                    onQuantityChange={(nextQty) => {
                                        if (nextQty > item.currentQuantity) {
                                            increase(item.cartItemId);
                                            return;
                                        }
                                        if (nextQty < item.currentQuantity) {
                                            decrease(item.cartItemId);
                                        }
                                    }}
                                    onRemove={() => remove(item.cartItemId)}
                                />
                            ))}
                            {items.length === 0 && (
                                <div className="bg-card p-8 rounded-lg border border-border text-center text-muted-foreground">
                                    {t('cart_empty', {}, "Your cart is empty. Start adding products from the product list.")}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-96 space-y-6">
                        <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <Ticket className="h-5 w-5 text-primary" />
                                <span>{t('promo_code', {}, "Promo Code")}</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder={t('enter_code', {}, "Enter code")}
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="min-h-11"
                                />
                                <Button
                                    onClick={handleApplyPromo}
                                    disabled={isCalculating || !promoCode.trim()}
                                    className="min-h-11"
                                >
                                    {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : t('apply', {}, "Apply")}
                                </Button>
                            </div>
                            {appliedDiscount && (
                                <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex justify-between items-center">
                                    <span>{appliedDiscount.name} ({appliedDiscount.code})</span>
                                    <button
                                        onClick={() => {
                                            setAppliedDiscount(null);
                                            setPromoCode("");
                                        }}
                                        className="text-xs underline"
                                    >
                                        {t('remove', {}, "Remove")}
                                    </button>
                                </div>
                            )}
                        </div>

                        <CartSummary
                            total={displayTotal}
                            discountAmount={displayDiscount}
                            itemCount={effectiveSelectedIds.length}
                            disableCheckout={effectiveSelectedIds.length === 0 || isCalculating}
                            checkoutHref={`/shipping?items=${effectiveSelectedIds.join(",")}${appliedDiscount ? `&discountId=${appliedDiscount.discountId}` : ""}`}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-20">
                <Subscribe variant="rounded" className="max-w-6xl" />
            </div>
        </div>
    );
}
