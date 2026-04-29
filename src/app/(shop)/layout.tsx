import Footer from "@/components/features/Footer";
import Header from "@/components/features/Header";

import { ChatbotWrapper } from "./ChatbotWrapper";

export default function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header variant="default" />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatbotWrapper />
        </div>
    );
}
