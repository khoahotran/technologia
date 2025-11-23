import * as React from "react"
import { MoreHorizontal, Settings2, Star, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  price: string
  rating?: number
  image?: string
  variant?: "default" | "compact" | "selectable"
  isSelected?: boolean
  onSelect?: () => void
  badge?: string
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
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-white border-transparent hover:border-primary/20",
        isSelected && "ring-2 ring-primary border-primary",
        className
      )}
      {...props}
    >
      {/* Badge */}
      {badge && variant === "default" && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="font-semibold">
            {badge}
          </Badge>
        </div>
      )}

      {/* Selection Checkbox */}
      {(variant === "selectable" || isSelected !== undefined) && (
        <div 
          className={cn(
            "absolute top-3 left-3 z-10 h-5 w-5 rounded border border-primary bg-white flex items-center justify-center cursor-pointer transition-colors hover:bg-primary/10",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary"
          )}
          onClick={onSelect}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
        </div>
      )}

      {/* Settings/Options Button */}
      <div className="absolute top-3 right-3 z-10">
        {variant !== "default" && !badge ? (
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary/10 text-secondary-foreground hover:bg-secondary/20">
             <Settings2 className="h-4 w-4" />
           </Button>
        ) : null}
      </div>

      <CardContent className={cn("p-0", variant === "compact" ? "flex items-center p-4 gap-4" : "")}>
        {variant !== "compact" && (
          <div className="aspect-[4/3] w-full bg-muted/20 flex items-center justify-center relative group">
            {image ? (
              <img src={image} alt={title} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                {/* Placeholder pattern */}
                <div className="w-16 h-16 rounded-full bg-muted/30" />
              </div>
            )}
            
            {/* Hover Overlay for Default Variant */}
            {variant === "default" && (
               <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm">
                    <Settings2 className="h-4 w-4" />
                  </Button>
               </div>
            )}
          </div>
        )}

        <div className={cn("flex flex-col", variant === "compact" ? "flex-1" : "p-5")}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground">
              {title}
            </h3>
            {variant === "compact" && (
               <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground">
                 <Settings2 className="h-4 w-4" />
               </Button>
            )}
          </div>

          {variant === "default" && (
            <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs text-muted-foreground mb-4">
              <span>Product property</span>
              <span>Product property</span>
              <span>Product property</span>
              <span>Product property</span>
            </div>
          )}

          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-foreground">{price}</span>
            </div>

            {variant === "default" && (
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-md rounded-full px-6">
                <Settings2 className="mr-2 h-4 w-4" />
                Button
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
