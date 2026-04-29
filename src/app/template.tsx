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
    <>
      {children}
    </>
  );
}