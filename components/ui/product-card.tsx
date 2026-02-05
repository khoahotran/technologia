"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

// ===========================================
// Types
// ===========================================

interface ProductCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  /** Product ID for navigation */
  id?: string | number | undefined;
  /** Product title */
  title: string;
  /** Formatted price string */
  price: string;
  /** Rating out of 5 */
  rating?: number | undefined;
  /** Product image URL */
  image?: string | undefined;
  /** Card variant */
  variant?: "default" | "compact" | "selectable" | undefined;
  /** Whether card is selected (for selectable variant) */
  isSelected?: boolean | undefined;
  /** Callback when card is selected */
  onSelect?: (() => void) | undefined;
  /** Badge text (e.g., "Sale", "New") */
  badge?: string | undefined;
  /** Callback when add to cart is clicked */
  onAddToCart?: (() => void) | undefined;
}

// ===========================================
// Component
// ===========================================

export function ProductCard({
  className,
  id,
  title,
  price,
  rating = 4,
  image,
  variant = "default",
  isSelected,
  onSelect,
  badge,
  onAddToCart,
  ...props
}: ProductCardProps) {
  const router = useRouter();

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      router.push(`/products/${id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.();
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "bg-white border-transparent hover:border-primary/20 pt-0",
        isSelected && "ring-2 ring-primary border-primary",
        className
      )}
      {...props}
    >
      {/* Badge */}
      {badge && variant === "default" && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="font-semibold rounded-full px-3">
            {badge}
          </Badge>
        </div>
      )}

      {/* Selection Checkbox */}
      {(variant === "selectable" || isSelected !== undefined) && (
        <button
          type="button"
          aria-checked={isSelected}
          role="checkbox"
          className={cn(
            "absolute top-3 left-3 z-10 h-5 w-5 rounded-full border border-primary",
            "bg-white flex items-center justify-center cursor-pointer",
            "transition-colors hover:bg-primary/10",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary"
          )}
          onClick={onSelect}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
          <span className="sr-only">Select {title}</span>
        </button>
      )}

      <CardContent
        className={cn(
          "p-0 h-full flex flex-col",
          variant === "compact" && "flex-row items-center p-4 gap-4"
        )}
      >
        {/* Product Image */}
        {variant !== "compact" && (
          <div className="aspect-square w-full bg-muted/30 flex items-center justify-center relative group p-6">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                <div className="w-16 h-16 rounded-full bg-muted/30" />
              </div>
            )}
          </div>
        )}

        {/* Product Info */}
        <div className={cn("flex flex-col flex-1", variant !== "compact" && "p-5")}>
          <div className="mb-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors min-h-[2.5em]">
              {title}
            </h3>
          </div>

          <div className="mt-auto">
            {/* Star Rating - Using shared component */}
            <div className="mb-2">
              <StarRating
                rating={rating}
                size="sm"
                filledColor="text-primary fill-primary"
                emptyColor="text-muted fill-muted"
              />
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">{price}</span>

              {variant === "default" && (
                <Button
                  className="bg-primary hover:bg-primary/90 text-white shadow-none rounded-full px-6 h-9 font-medium"
                  onClick={handleDetailsClick}
                >
                  Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
