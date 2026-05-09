"use client";

import { Loader2, Tag, Ticket } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { CartItem } from "@/components/features/cart/CartItem";
import { CartSummary } from "@/components/features/cart/CartSummary";
import { Subscribe } from "@/components/features/home/Subscribe";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { calculateCartPrice } from "@/features/cart/api";
import { useCart } from "@/features/cart/hooks";
import { CountPriceResponse } from "@/features/cart/types";
import { getDiscountByCode, getUserDiscounts } from "@/features/discounts/api";
import { DiscountResponse } from "@/features/discounts/types";
import { useLanguage } from "@/providers/language.provider";
import { useOrderFlowStore } from "@/store/order-flow.store";
import { cn } from "@/utils";

export default function CartClient() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const { cart, isLoading, isError, increase, decrease, remove } = useCart();

    const items = useMemo(() => cart?.cartItems ?? [], [cart]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [hasUserSelection, setHasUserSelection] = useState(false);
    const setSelectedCartItemIds = useOrderFlowStore((state) => state.setSelectedCartItemIds);
    const effectiveSelectedIds = useMemo(() =>
        hasUserSelection ? selectedIds : items.map((item) => item.cartItemId),
        [hasUserSelection, selectedIds, items]
    );

    // Handle focusProduct param: auto-select the bought product
    const focusApplied = useRef(false);
    useEffect(() => {
        const focusProductId = searchParams.get("focusProduct");
        if (focusApplied.current || !focusProductId || items.length === 0) return;
        const matchedItem = items.find((item) => item.productId === focusProductId);
        if (matchedItem) {
            setHasUserSelection(true);
            setSelectedIds([matchedItem.cartItemId]);
            focusApplied.current = true;
        }
    }, [searchParams, items]);

    // Discount state
    const [promoCode, setPromoCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountResponse | null>(null);
    const [priceResult, setPriceResult] = useState<CountPriceResponse | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [availableDiscounts, setAvailableDiscounts] = useState<DiscountResponse[]>([]);

    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const userDiscounts = await getUserDiscounts().catch(() => [] as DiscountResponse[]);
                setAvailableDiscounts(userDiscounts);
            } catch (error) {
                console.error("Failed to fetch discounts", error);
            }
        };
        fetchDiscounts();
    }, []);

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
    }, [effectiveSelectedIds, appliedDiscount, items]);

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
        } catch {
            toast.error(t('promo_error', {}, "Failed to verify promo code"));
        } finally {
            setIsCalculating(false);
        }
    };

    const toggleItem = (id: string) => {
        const allIds = items.map((item) => item.cartItemId);
        if (!hasUserSelection) {
            setHasUserSelection(true);
            setSelectedIds(allIds.filter((itemId) => itemId !== id));
        } else {
            setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
            );
        }
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
                                <div className="bg-card p-12 rounded-xl border border-dashed border-border text-center text-muted-foreground flex flex-col items-center gap-6">
                                    <p className="text-lg italic font-medium">
                                        {t('cart_empty', {}, "Giỏ hàng của bạn đang cảm thấy 'cô đơn' quá... Đi 'hẹn hò' với vài sản phẩm xịn xò ngay thôi!")}
                                    </p>
                                    <Button asChild className="rounded-full px-8 h-12 text-base shadow-lg transition-transform hover:scale-105 active:scale-95">
                                        <Link href="/products">{t('go_shopping', {}, "Đến cửa hàng ngay")}</Link>
                                    </Button>
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

                        {availableDiscounts.length > 0 && (
                            <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                                <div className="flex items-center gap-2 text-foreground font-medium">
                                    <Tag className="h-5 w-5 text-primary" />
                                    <span>{t('available_discounts', {}, "Available Discounts")}</span>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                    {availableDiscounts.map((discount) => (
                                        <button
                                            key={discount.discountId}
                                            onClick={() => {
                                                setPromoCode(discount.code);
                                                setAppliedDiscount(discount);
                                                toast.success(t('promo_applied', { code: discount.code }, `Promo code ${discount.code} applied!`));
                                            }}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border transition-all hover:border-primary/50 group",
                                                appliedDiscount?.discountId === discount.discountId
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border bg-gray-50/50"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors truncate">
                                                        {discount.code}
                                                    </span>
                                                    {discount.scope === "USER_SPECIFIC" && (
                                                        <span className="text-[10px] font-semibold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
                                                            {t('your_discount_badge', {}, "For you")}
                                                        </span>
                                                    )}
                                                </div>
                                                {discount.discountValue > 0 && (
                                                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">
                                                        -{discount.type === 'PERCENTAGE' ? `${discount.discountValue}%` : `${new Intl.NumberFormat().format(discount.discountValue)} VND`}
                                                    </span>
                                                )}
                                            </div>
                                            {/* <p className="text-xs text-muted-foreground line-clamp-2">{discount.description || discount.name}</p> */}
                                            {/* {discount.minOrderValue && discount.minOrderValue > 0 && (
                                                <p className="text-[11px] text-muted-foreground/70 mt-1">
                                                    {t('min_order_value', {}, "Min order:")} {new Intl.NumberFormat().format(discount.minOrderValue)} VND
                                                </p>
                                            )} */}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <CartSummary
                            total={displayTotal}
                            discountAmount={displayDiscount}
                            itemCount={effectiveSelectedIds.length}
                            disableCheckout={effectiveSelectedIds.length === 0 || isCalculating}
                            checkoutHref={`/shipping?items=${effectiveSelectedIds.join(",")}${appliedDiscount ? `&voucherCode=${appliedDiscount.code}` : ""}`}
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
