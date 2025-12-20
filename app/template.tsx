import type { ReactNode } from "react";

import { Chatbot } from "@/components/features/Chatbot";
import Footer from "@/components/features/Footer";
import Header from "@/components/features/Header";


export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="default" />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
