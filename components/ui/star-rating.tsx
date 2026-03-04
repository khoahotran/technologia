"use client";

/**
 * Thành phần Đánh giá sao (Star Rating Component)
 * 
 * Hiển thị điểm số dưới dạng các biểu tượng hình sao. 
 * Hỗ trợ chế độ chỉ đọc (Read-only) và chế độ tương tác (Interactive) để người dùng có thể bình chọn.
 */
import { Star } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
    /** Điểm hiện tại (từ 0 đến tối đa) */
    rating: number;
    /** Số lượng sao tối đa (Mặc định: 5) */
    max?: number;
    /** Kích thước của ngôi sao (sm, md, lg) */
    size?: "sm" | "md" | "lg";
    /** Có hiển thị con số điểm bên cạnh hay không */
    showValue?: boolean;
    /** Cấu trúc class CSS bổ sung */
    className?: string;
    /** Cho phép người dùng nhấn để thay đổi điểm số hay không */
    interactive?: boolean;
    /** Sự kiện gọi lại khi người dùng thay đổi điểm (chỉ khi interactive=true) */
    onRatingChange?: (rating: number) => void;
    /** Màu sắc của ngôi sao đã được tô bóng (Filled) */
    filledColor?: string;
    /** Màu sắc của ngôi sao chưa được tô bóng (Empty) */
    emptyColor?: string;
}

/** Bản đồ kích thước tương ứng với các đơn vị CSS */
const sizeMap = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
};

/**
 * Thành phần StarRating
 */
export function StarRating({
    rating,
    max = 5,
    size = "sm",
    showValue = false,
    className,
    interactive = false,
    onRatingChange,
    filledColor = "fill-primary text-primary",
    emptyColor = "fill-muted text-muted",
}: StarRatingProps) {
    // Trạng thái lưu trữ giá trị tạm thời khi di chuột qua (Hover effect)
    const [hoverRating, setHoverRating] = React.useState<number | null>(null);

    // Ưu tiên hiển thị giá trị hover nếu đang tương tác, ngược lại dùng giá trị thực
    const displayRating = hoverRating ?? rating;

    /** Xử lý khi người dùng click vào ngôi sao */
    const handleClick = (index: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(index + 1);
        }
    };

    /** Hiệu ứng tô sao khi di chuột vào */
    const handleMouseEnter = (index: number) => {
        if (interactive) {
            setHoverRating(index + 1);
        }
    };

    /** Xóa hiệu ứng tô sao khi rời chuột ra */
    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(null);
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className="flex items-center gap-0.5">
                {Array.from({ length: max }).map((_, index) => {
                    // Ngôi sao thứ (index + 1) có được tô màu hay không
                    const isFilled = index < displayRating;

                    return (
                        <Star
                            key={index}
                            className={cn(
                                sizeMap[size],
                                "transition-colors",
                                isFilled ? filledColor : emptyColor,
                                interactive &&
                                "cursor-pointer hover:scale-110 transition-transform"
                            )}
                            onClick={() => handleClick(index)}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        />
                    );
                })}
            </div>

            {/* Hiển thị con số (Ví dụ: 4.5) nếu showValue là true */}
            {showValue && (
                <span className="text-sm text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
