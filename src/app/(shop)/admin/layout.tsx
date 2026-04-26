import type { ReactNode } from "react";

import Footer from "@/components/features/Footer";
import { AdminHeader } from "@/components/features/admin/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F4F1F3] flex flex-col">
            <AdminHeader />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
