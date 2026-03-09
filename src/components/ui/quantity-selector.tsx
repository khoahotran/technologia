"use client";

/**
 * Thành phần Chọn số lượng (Quantity Selector Component)
 * 
 * Cung cấp giao diện để người dùng tăng/giảm số lượng sản phẩm bằng nút bấm (+/-) 
 * hoặc nhập trực tiếp từ bàn phím.
 */
import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface QuantitySelectorProps {
    /** Giá trị số lượng hiện tại */
    value: number;
    /** Sự kiện gọi lại khi số lượng thay đổi */
    onChange: (value: number) => void;
    /** Giá trị tối thiểu cho phép (Mặc định: 1) */
    min?: number;
    /** Giá trị tối đa cho phép (Mặc định: 99) */
    max?: number;
    /** Trạng thái vô hiệu hóa toàn bộ component */
    disabled?: boolean;
    /** Biến thể kích cỡ hiển thị (sm, md, lg) */
    size?: "sm" | "md" | "lg";
    /** Class CSS tùy chỉnh bổ sung */
    className?: string;
}

/** Bản đồ kích thước cho các thành phần con (nút, ô nhập, icon) */
const sizeMap = {
    sm: {
        button: "h-7 w-7",
        input: "w-10 h-7 text-sm",
        icon: "h-3 w-3",
    },
    md: {
        button: "h-9 w-9",
        input: "w-14 h-9 text-base",
        icon: "h-4 w-4",
    },
    lg: {
        button: "h-11 w-11",
        input: "w-16 h-11 text-lg",
        icon: "h-5 w-5",
    },
};

/**
 * Thành phần QuantitySelector
 */
export function QuantitySelector({
    value,
    onChange,
    min = 1,
    max = 99,
    disabled = false,
    size = "md",
    className,
}: QuantitySelectorProps) {
    const sizes = sizeMap[size];

    /** Xử lý khi nhấn nút Giảm (-) */
    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    /** Xử lý khi nhấn nút Tăng (+) */
    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    /** Xử lý khi người dùng nhập số trực tiếp vào ô input */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue)) {
            // Đảm bảo giá trị nằm trong khoảng [min, max]
            const clampedValue = Math.max(min, Math.min(max, newValue));
            onChange(clampedValue);
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Nút Giảm số lượng */}
            <Button
                variant="outline"
                size="icon"
                className={cn(sizes.button, "rounded-full")}
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                aria-label="Giảm số lượng"
            >
                <Minus className={sizes.icon} />
            </Button>

            {/* Ô nhập số lượng trực tiếp */}
            <input
                type="number"
                value={value}
                onChange={handleInputChange}
                disabled={disabled}
                min={min}
                max={max}
                className={cn(
                    sizes.input,
                    "text-center border rounded-md font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    // Ẩn các nút tăng giảm mặc định của trình duyệt để dùng nút custom
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
                aria-label="Số lượng"
            />

            {/* Nút Tăng số lượng */}
            <Button
                variant="outline"
                size="icon"
                className={cn(sizes.button, "rounded-full")}
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                aria-label="Tăng số lượng"
            >
                <Plus className={sizes.icon} />
            </Button>
        </div>
    );
}
