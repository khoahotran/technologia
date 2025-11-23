import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import { Chatbot } from "@/components/features/Chatbot";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="with-categories" />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
