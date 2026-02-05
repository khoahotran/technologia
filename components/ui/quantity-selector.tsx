"use client";

import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
    /** Current quantity value */
    value: number;
    /** Callback when quantity changes */
    onChange: (value: number) => void;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Whether the component is disabled */
    disabled?: boolean;
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Custom class name */
    className?: string;
}

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

    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue)) {
            const clampedValue = Math.max(min, Math.min(max, newValue));
            onChange(clampedValue);
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Decrement Button */}
            <Button
                variant="outline"
                size="icon"
                className={cn(sizes.button, "rounded-full")}
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                aria-label="Decrease quantity"
            >
                <Minus className={sizes.icon} />
            </Button>

            {/* Quantity Input */}
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
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
                aria-label="Quantity"
            />

            {/* Increment Button */}
            <Button
                variant="outline"
                size="icon"
                className={cn(sizes.button, "rounded-full")}
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                aria-label="Increase quantity"
            >
                <Plus className={sizes.icon} />
            </Button>
        </div>
    );
}
