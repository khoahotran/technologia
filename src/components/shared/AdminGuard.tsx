"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const hydrated = useAuthStore((state) => state.hydrated);
  const router = useRouter();
  const isAuthorized = hydrated && isAuthenticated && user?.role === "ADMIN";

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isAuthenticated, user, hydrated, router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
