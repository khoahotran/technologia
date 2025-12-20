"use client";

import { Loader2 } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

export const ScreenLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <Loader2 className="animate-spin text-white w-16 h-16" />
      {message && <p className="mt-4 text-white text-lg">{message}</p>}
    </div>
  );
};

export const FullLoading: React.FC<{
  message?: string;
  className?: string;
}> = ({ message, className }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full h-full",
        className
      )}
    >
      <Loader2 className="animate-spin w-12 h-12 text-gray-700" />
      {message && <p className="mt-2 text-gray-700">{message}</p>}
    </div>
  );
};

export const SmallLoading: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <Loader2
      className={cn(
        "animate-spin w-5 h-5 text-gray-500 inline-block",
        className
      )}
    />
  );
};
