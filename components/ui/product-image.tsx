"use client";

import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

interface ProductImageProps {
    /** Image source URL */
    src?: string;
    /** Alt text for accessibility */
    alt: string;
    /** Aspect ratio of the image container */
    aspectRatio?: "square" | "video" | "portrait";
    /** Whether to add hover zoom effect */
    hoverZoom?: boolean;
    /** Custom class name */
    className?: string;
    /** Container class name */
    containerClassName?: string;
    /** Image sizes for responsive loading */
    sizes?: string;
    /** Fill mode (default: contain) */
    objectFit?: "contain" | "cover";
    /** Priority loading */
    priority?: boolean;
}

const aspectRatioMap = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
};

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

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
    };

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
            {/* Loading skeleton */}
            {isLoading && src && !hasError && (
                <div className="absolute inset-0 bg-muted/30 animate-pulse" />
            )}

            {src && !hasError ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    className={cn(
                        "transition-all duration-300",
                        objectFit === "contain" ? "object-contain p-4" : "object-cover",
                        hoverZoom && "group-hover:scale-105",
                        isLoading && "opacity-0",
                        !isLoading && "opacity-100",
                        className
                    )}
                    sizes={sizes}
                    onError={handleError}
                    onLoad={handleLoad}
                />
            ) : (
                // Placeholder
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                    <div className="w-16 h-16 rounded-full bg-muted/30" />
                </div>
            )}
        </div>
    );
}
