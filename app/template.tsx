import Navbar from "@/components/features/Navbar";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="p-4 text-center border-t">
        © 2025 My Electronics Store
      </footer>
    </div>
  );
}
