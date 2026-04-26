"use client";

import { AlertCircle } from "lucide-react";

import { cn } from "@/utils/cn";

export function UnknownApiNotice({
    text,
    className,
}: {
    text: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 rounded-full border border-[#D6B57D] bg-[#FFF8EE] px-3 py-1 text-xs font-semibold text-[#8A6532]",
                className
            )}
        >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>UNKNOWN</span>
            <span className="font-normal text-[#6E5A37]">{text}</span>
        </div>
    );
}

