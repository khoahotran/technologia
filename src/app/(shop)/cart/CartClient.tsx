"use client";

import { Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CartItem } from "@/components/features/cart/CartItem";
import { CartSummary } from "@/components/features/cart/CartSummary";
import { Subscribe } from "@/components/features/home/Subscribe";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/features/cart/hooks";
import { useLanguage } from "@/providers/language.provider";
import { useOrderFlowStore } from "@/store/order-flow.store";

export default function CartClient() {
    const { t } = useLanguage();
    const { cart, isLoading, isError, increase, decrease, remove } = useCart();

    const items = useMemo(() => cart?.cartItems ?? [], [cart]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [hasUserSelection, setHasUserSelection] = useState(false);
    const setSelectedCartItemIds = useOrderFlowStore((state) => state.setSelectedCartItemIds);
    const effectiveSelectedIds = hasUserSelection
        ? selectedIds
        : items.map((item) => item.cartItemId);

    // Simple client-side total for now
    const total = useMemo(
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
                <p className="text-gray-500">{t('loading_cart', {}, "Loading cart...")}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 text-center max-w-md">
                    <p className="text-red-500 font-medium">{t('cannot_load_cart', {}, "Cannot load cart from backend.")}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {t('login_to_view_cart', {}, "Please login first or check cart service connection.")}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 rounded-lg bg-secondary text-white"
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
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                                />
                                <span className="font-medium text-gray-900">{t('select_all', {}, "Select All")}</span>
                            </div>
                            <button
                                type="button"
                                className="text-red-500 hover:text-red-600 font-medium"
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
                                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                                    {t('cart_empty', {}, "Your cart is empty. Start adding products from the product list.")}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-96 space-y-6">
                        <div className="bg-accent p-4 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium">
                            <Ticket className="h-5 w-5" />
                            <span>{t('promo_mocked', {}, "Promo code support is mocked")}</span>
                        </div>

                        <CartSummary
                            total={total}
                            itemCount={effectiveSelectedIds.length}
                            disableCheckout={effectiveSelectedIds.length === 0}
                            checkoutHref={`/shipping?items=${effectiveSelectedIds.join(",")}`}
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
