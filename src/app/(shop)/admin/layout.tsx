import type { ReactNode } from "react";

import { AdminHeader } from "@/components/features/admin/AdminHeader";
import { AdminGuard } from "@/components/shared/AdminGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-background flex flex-col">
                <AdminHeader />
                <main className="flex-1">{children}</main>
            </div>
        </AdminGuard>
    );
}
