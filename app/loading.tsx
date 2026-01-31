"use client";

import { Loader2 } from "lucide-react";

export default function Loading({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <Loader2 className="animate-spin text-white w-16 h-16" />
      {message && <p className="mt-4 text-white text-lg">{message}</p>}
    </div>
  );
}
