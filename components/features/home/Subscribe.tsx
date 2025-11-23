"use client"

import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SubscribeProps {
  variant?: "default" | "rounded"
  className?: string
}

export function Subscribe({ variant = "default", className }: SubscribeProps) {
  return (
    <section className={cn("container mx-auto px-4 py-12", className)}>
      <div
        className={cn(
          "flex flex-col lg:flex-row items-center justify-between gap-8 bg-[#8AB0C3] p-8 md:p-12",
          variant === "rounded" ? "rounded-[32px]" : "rounded-none"
        )}
      >
        <div className="flex items-start gap-6 max-w-xl">
          <div className="bg-white/20 p-3 rounded-xl shrink-0">
             <Mail className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Sign up for Newsletters</h3>
            <p className="text-blue-50/90 text-sm leading-relaxed">
              Join our community of tech lovers and never miss a launch again.
              Weekly insights, special offers, and cutting-edge updates.
            </p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="relative flex items-center">
            <Input
              type="email"
              placeholder="Enter your email here"
              className="h-14 w-full rounded-xl bg-white pl-6 pr-32 text-base border-none shadow-sm placeholder:text-gray-400 focus-visible:ring-0"
            />
            <Button
              className="absolute right-1.5 top-1.5 h-11 rounded-lg bg-[#5B6C8F] px-6 font-semibold text-white hover:bg-[#4A5975]"
            >
              SUBSCRIBE
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
