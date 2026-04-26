"use client";

import type { ReactNode } from "react";

import dynamic from "next/dynamic";

import Footer from "@/components/features/Footer";
import Header from "@/components/features/Header";

const Chatbot = dynamic(
  () => import("@/components/features/Chatbot").then((mod) => mod.Chatbot),
  {
    loading: () => null,
    ssr: false,
  }
);

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