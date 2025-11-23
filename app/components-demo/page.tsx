"use client"

import { ProductCard } from "@/components/ui/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ComponentsDemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Product Card Variants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Default Variant */}
            <ProductCard
              title="Product name 2 lines"
              price="1.000.000"
              badge="Badge"
              variant="default"
            />

            {/* Default Variant - No Badge */}
            <ProductCard
              title="Another Product with a longer name that might wrap to two lines"
              price="2.500.000"
              rating={3}
              variant="default"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Compact & Selectable</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Compact Variant */}
            <ProductCard
              title="Compact Product"
              price="500.000"
              variant="compact"
            />

            {/* Selectable Variant */}
            <ProductCard
              title="Selectable Product"
              price="1.200.000"
              variant="selectable"
              isSelected={selectedId === "1"}
              onSelect={() => setSelectedId(selectedId === "1" ? null : "1")}
            />
            
             {/* Selectable Variant - Selected */}
             <ProductCard
              title="Selected Product"
              price="1.200.000"
              variant="selectable"
              isSelected={true}
            />
          </div>
        </section>


        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Core Components</h2>
          
          <div className="space-y-8">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Badges</h3>
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            {/* Inputs & Checkboxes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inputs & Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                <div className="space-y-2">
                  <Input placeholder="Default Input" />
                  <Input placeholder="Disabled Input" disabled />
                </div>
                <div className="flex items-center space-x-2">
                   <Checkbox id="terms" />
                   <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Accept terms and conditions
                  </label>
                </div>
              </div>
            </div>

            {/* Avatars */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Avatars</h3>
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
