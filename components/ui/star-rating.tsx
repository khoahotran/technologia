"use client";

import { Star } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
    /** Current rating value (0-5) */
    rating: number;
    /** Maximum rating value */
    max?: number;
    /** Size of the stars */
    size?: "sm" | "md" | "lg";
    /** Whether to show the rating number */
    showValue?: boolean;
    /** Custom class name */
    className?: string;
    /** Whether the rating is interactive */
    interactive?: boolean;
    /** Callback when rating changes (only if interactive) */
    onRatingChange?: (rating: number) => void;
}

const sizeMap = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
};

export function StarRating({
    rating,
    max = 5,
    size = "sm",
    showValue = false,
    className,
    interactive = false,
    onRatingChange,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = React.useState<number | null>(null);

    const displayRating = hoverRating ?? rating;

    const handleClick = (index: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(index + 1);
        }
    };

    const handleMouseEnter = (index: number) => {
        if (interactive) {
            setHoverRating(index + 1);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(null);
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className="flex items-center gap-0.5">
                {Array.from({ length: max }).map((_, index) => (
                    <Star
                        key={index}
                        className={cn(
                            sizeMap[size],
                            "transition-colors",
                            index < displayRating
                                ? "fill-primary text-primary"
                                : "fill-muted text-muted",
                            interactive && "cursor-pointer hover:scale-110 transition-transform"
                        )}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                    />
                ))}
            </div>

            {showValue && (
                <span className="text-sm text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
