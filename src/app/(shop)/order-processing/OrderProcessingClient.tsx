"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetOrderIdBySagaId } from "@/features/orders/hooks";

export default function OrderProcessingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sagaId = searchParams.get("sagaId");
    const getOrderIdBySagaId = useGetOrderIdBySagaId();

    const [step, setStep] = useState(0);

    const steps = [
        "Confirming your cart...",
        "Creating your order...",
        "Processing payment...",
        "Finalizing your order..."
    ];

    useEffect(() => {
        // fake progress animation
        const stepInterval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500);

        return () => clearInterval(stepInterval);
    }, []);

    useEffect(() => {
        if (!sagaId) return;

        const interval = setInterval(async () => {
            const orderId = await getOrderIdBySagaId(sagaId);

            if (orderId) {
                clearInterval(interval);
                router.push(`/orders/${orderId}`);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [sagaId, router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F9F8FE]">
            
            {/* Pulse circle */}
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-[#8AB0C3] opacity-30 animate-ping absolute"></div>
                <div className="w-16 h-16 rounded-full bg-[#8AB0C3] flex items-center justify-center text-white text-xl font-bold">
                    🛒
                </div>
            </div>

            {/* Animated text */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2 transition-all duration-500">
                {steps[step]}
            </h2>

            {/* Dots animation */}
            <div className="flex gap-1 mb-6">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            </div>

            {/* Fake progress bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#8AB0C3] transition-all duration-700"
                    style={{ width: `${(step + 1) * 25}%` }}
                />
            </div>

            <p className="text-sm text-gray-500 mt-4">
                Please do not close this page while we process your order
            </p>
        </div>
    );
}