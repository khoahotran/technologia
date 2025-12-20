"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  containerClassName?: string
}

export const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="relative rounded-lg border border-gray-200 bg-white px-3 py-1 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <label className="text-xs font-medium text-gray-500 block mb-0.5">
            {label}
          </label>
          <input
            ref={ref}
            className={cn(
              "block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6",
              className
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)
LabeledInput.displayName = "LabeledInput"

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  provider: string
}

export function SocialButton({ icon, provider, className, ...props }: SocialButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "w-full h-12 justify-start gap-3 rounded-lg border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
      {...props}
    >
      {icon}
      <span className="font-medium">Continue with {provider}</span>
    </Button>
  )
}
