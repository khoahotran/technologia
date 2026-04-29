"use client";

/**
 * Thành phần Hình ảnh Sản phẩm (Product Image Component)
 * 
 * Một trình bao bọc cho thành phần Image của Next.js, 
 * được tối ưu hóa cho việc hiển thị ảnh sản phẩm với:
 * - Trạng thái đang tải (Loading Skeleton).
 * - Xử lý ảnh lỗi (Fallback).
 * - Hiệu ứng phóng to khi di chuột (Hover zoom).
 * - Quản lý tỉ lệ khung hình (Aspect ratio).
 */
import Image from "next/image";
import * as React from "react";

import { cn } from "@/utils/cn";

interface ProductImageProps {
    /** Đường dẫn ảnh (URL) */
    src?: string;
    /** Văn bản thay thế cho SEO và khả năng tiếp cận */
    alt: string;
    /** Tỉ lệ khung hình (square: vuông, video: 16/9, portrait: 3/4) */
    aspectRatio?: "square" | "video" | "portrait";
    /** Có bật hiệu ứng phóng to khi di chuột không */
    hoverZoom?: boolean;
    /** Class CSS tùy chỉnh cho thẻ ảnh thực tế */
    className?: string;
    /** Class CSS tùy chỉnh cho khung bao bên ngoài */
    containerClassName?: string;
    /** Kích thước ảnh cho việc tải ảnh linh hoạt (Responsive sizes) */
    sizes?: string;
    /** Cách ảnh lấp đầy khung hình (contain: giữ tỉ lệ, cover: phủ kín) */
    objectFit?: "contain" | "cover";
    /** Có ưu tiên tải trước ảnh này không (LCP optimization) */
    priority?: boolean;
}

/** Bản đồ các class tỉ lệ khung hình */
const aspectRatioMap = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
};

/**
 * Thành phần ProductImage
 */
export function ProductImage({
    src,
    alt,
    aspectRatio = "square",
    hoverZoom = false,
    className,
    containerClassName,
    sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    objectFit = "contain",
    priority = false,
}: ProductImageProps) {
    const [hasError, setHasError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    /** Xử lý khi ảnh bị lỗi (không tồn tại hoặc 404) */
    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    /** Xử lý khi ảnh đã tải xong hoàn toàn */
    const handleLoad = () => {
        setIsLoading(false);
    };

    return (
        <div
            className={cn(
                aspectRatioMap[aspectRatio],
                "w-full bg-muted/30 flex items-center justify-center relative group overflow-hidden",
                containerClassName
            )}
        >
            {/* 1. Hiển thị Skeleton khi đang trong trạng thái chờ tải */}
            {isLoading && src && !hasError && (
                <div className="absolute inset-0 bg-muted/30 animate-pulse" />
            )}

            {/* 2. Hiển thị ảnh thực tế nếu có URL và không gặp lỗi */}
            {src && !hasError ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    className={cn(
                        "transition-all duration-300",
                        objectFit === "contain" ? "object-contain p-4" : "object-cover",
                        hoverZoom && "group-hover:scale-105", // Phóng to 5% khi di chuột vào nhóm cha
                        isLoading && "opacity-0",
                        !isLoading && "opacity-100",
                        className
                    )}
                    sizes={sizes}
                    onError={handleError}
                    onLoad={handleLoad}
                />
            ) : (
                // 3. Hiển thị Placeholder (Chỗ trống dự phòng) nếu ko có ảnh hoặc gặp lỗi tải
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                    <div className="w-16 h-16 rounded-full bg-muted/30" />
                </div>
            )}
        </div>
    );
}
