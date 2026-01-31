import { Star, Check } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  price: string
  rating?: number
  image?: string
  variant?: "default" | "compact" | "selectable"
  isSelected?: boolean
  onSelect?: () => void
  badge?: string | undefined
}

export function ProductCard({
  className,
  title,
  price,
  rating = 4,
  image,
  variant = "default",
  isSelected,
  onSelect,
  badge,
  ...props
}: ProductCardProps) {
  const router = useRouter()
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-white border-transparent hover:border-primary/20 pt-0",
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
            "absolute top-3 left-3 z-10 h-5 w-5 rounded-full border border-primary bg-white flex items-center justify-center cursor-pointer transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary"
          )}
          onClick={onSelect}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
          <span className="sr-only">Select {title}</span>
        </button>
      )}

      <CardContent className={cn("p-0 h-full flex flex-col", variant === "compact" ? "flex-row items-center p-4 gap-4" : "")}>
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

        <div className={cn("flex flex-col flex-1", variant === "compact" ? "" : "p-5")}>
          <div className="mb-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors min-h-[2.5em]">
              {title}
            </h3>
          </div>

          {/* {variant === "default" && (
            <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs text-muted-foreground mb-4 opacity-80">
              <span>Product property</span>
              <span>Product property</span>
            </div>
          )} */}

          <div className="mt-auto">
            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < rating ? "fill-primary text-primary" : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">{price}</span>

              {variant === "default" && (
                <Button
                  className="bg-primary hover:bg-primary/90 text-white shadow-none rounded-full px-6 h-9 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/products/${props.id}`);
                  }}
                >
                  Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
