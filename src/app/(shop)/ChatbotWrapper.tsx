"use client";

import dynamic from "next/dynamic";

const Chatbot = dynamic(
    () => import("@/components/features/Chatbot").then((mod) => mod.Chatbot),
    {
        loading: () => null,
        ssr: false,
    }
);

export function ChatbotWrapper() {
    return <Chatbot />;
}
