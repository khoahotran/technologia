"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/shared/utils/format";

interface PriceDisplayProps {
    /** Price value (can be string or number) */
    price: string | number;
    /** Original price for discount display */
    originalPrice?: string | number | undefined;
    /** Currency code (default: VND) */
    currency?: string | undefined;
    /** Size variant */
    size?: "sm" | "md" | "lg" | "xl" | undefined;
    /** Custom class name */
    className?: string | undefined;
    /** Custom class for original price */
    originalPriceClassName?: string | undefined;
    /** Show discount percentage */
    showDiscountPercent?: boolean | undefined;
}

const sizeMap = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
};

const originalSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
};

export function PriceDisplay({
    price,
    originalPrice,
    currency = "VND",
    size = "md",
    className,
    originalPriceClassName,
    showDiscountPercent = false,
}: PriceDisplayProps) {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    const numericOriginal =
        originalPrice !== undefined
            ? typeof originalPrice === "string"
                ? parseFloat(originalPrice)
                : originalPrice
            : undefined;

    const hasDiscount =
        numericOriginal !== undefined && numericOriginal > numericPrice;

    const discountPercent = hasDiscount
        ? Math.round(((numericOriginal! - numericPrice) / numericOriginal!) * 100)
        : 0;

    return (
        <div className={cn("flex items-center gap-2 flex-wrap", className)}>
            {/* Current Price */}
            <span className={cn("font-bold text-primary", sizeMap[size])}>
                {formatCurrency(numericPrice, currency)}
            </span>

            {/* Original Price (strikethrough) */}
            {hasDiscount && (
                <span
                    className={cn(
                        "text-muted-foreground line-through",
                        originalSizeMap[size],
                        originalPriceClassName
                    )}
                >
                    {formatCurrency(numericOriginal!, currency)}
                </span>
            )}

            {/* Discount Badge */}
            {hasDiscount && showDiscountPercent && (
                <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                    -{discountPercent}%
                </span>
            )}
        </div>
    );
}
