"use client";

/**
 * Thành phần Hiển thị giá (Price Display Component)
 * 
 * Chuyên biệt phục vụ việc hiển thị giá tiền sản phẩm, hỗ trợ định dạng tiền tệ, 
 * hiển thị giá gốc (kèm gạch ngang) và thẻ phần trăm giảm giá.
 */
import * as React from "react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/shared/utils/format";

interface PriceDisplayProps {
    /** Giá trị giá hiện tại (số hoặc chuỗi) */
    price: string | number;
    /** Giá gốc trước khi giảm (tùy chọn) */
    originalPrice?: string | number | undefined;
    /** Mã tiền tệ (Mặc định: VND) */
    currency?: string | undefined;
    /** Biến thể kích thước chữ (sm, md, lg, xl) */
    size?: "sm" | "md" | "lg" | "xl" | undefined;
    /** Class CSS cho container chính */
    className?: string | undefined;
    /** Class CSS riêng cho phần hiển thị giá gốc */
    originalPriceClassName?: string | undefined;
    /** Có hiển thị thẻ (%) giảm giá hay không */
    showDiscountPercent?: boolean | undefined;
}

/** Bản đồ cỡ chữ cho giá hiện tại */
const sizeMap = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
};

/** Bản đồ cỡ chữ cho giá gốc (thường nhỏ hơn giá hiện tại) */
const originalSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
};

/**
 * Thành phần PriceDisplay
 */
export function PriceDisplay({
    price,
    originalPrice,
    currency = "VND",
    size = "md",
    className,
    originalPriceClassName,
    showDiscountPercent = false,
}: PriceDisplayProps) {
    // Chuyển đổi dữ liệu sang kiểu số
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    const numericOriginal =
        originalPrice !== undefined
            ? typeof originalPrice === "string"
                ? parseFloat(originalPrice)
                : originalPrice
            : undefined;

    // Kiểm tra xem có đang thực hiện giảm giá hay không
    const hasDiscount =
        numericOriginal !== undefined && numericOriginal > numericPrice;

    // Tính toán phần trăm giảm giá
    const discountPercent = hasDiscount
        ? Math.round(((numericOriginal! - numericPrice) / numericOriginal!) * 100)
        : 0;

    return (
        <div className={cn("flex items-center gap-2 flex-wrap", className)}>
            {/* Giá hiện tại (Giá sau giảm) */}
            <span className={cn("font-bold text-primary", sizeMap[size])}>
                {formatCurrency(numericPrice, currency)}
            </span>

            {/* Giá gốc (Bị gạch ngang) */}
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

            {/* Thẻ hiển thị số % giảm giá (Badge) */}
            {hasDiscount && showDiscountPercent && (
                <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                    -{discountPercent}%
                </span>
            )}
        </div>
    );
}
