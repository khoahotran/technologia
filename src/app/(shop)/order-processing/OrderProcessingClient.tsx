"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCreatePayment, useGetOrderIdBySagaId } from "@/features/orders/hooks";
import { useCancelPayment, useSimulatePayment } from "@/features/orders/hooks";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

export default function OrderProcessingPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sagaId = searchParams.get("sagaId");
    const paymentMethod = searchParams.get("paymentMethod");
    const getOrderIdBySagaId = useGetOrderIdBySagaId();

    const [step, setStep] = useState(0);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [simulating, setSimulating] = useState(false);

    const createPayment = useCreatePayment();
    const simulatePayment = useSimulatePayment();
    const cancelPayment = useCancelPayment();

    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const steps = [
        t('order_step_confirming', {}, "Confirming your cart..."),
        t('order_step_creating', {}, "Creating your order..."),
        t('order_step_payment', {}, "Processing payment..."),
        t('order_step_finalizing', {}, "Finalizing your order..."),
    ];

    const isNonCod = paymentMethod && paymentMethod !== "COD";

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500);
        return () => clearInterval(stepInterval);
    }, [steps.length]);

    const startPolling = useCallback(() => {
        if (!sagaId) return;

        pollingRef.current = setInterval(async () => {
            const id = await getOrderIdBySagaId(sagaId);
            if (id) {
                setOrderId(id);
                if (pollingRef.current) clearInterval(pollingRef.current);
            }
        }, 2000);
    }, [sagaId, getOrderIdBySagaId]);

    useEffect(() => {
        startPolling();
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [startPolling]);

    useEffect(() => {
        if (orderId && isNonCod && !paymentId) {
            createPayment.mutate(
                { orderId, sagaId: sagaId!, paymentMethod },
                {
                    onSuccess: (newPaymentId) => {
                        setPaymentId(newPaymentId);
                    },
                    onError: (err) => {
                        setError(toErrorMessage(err, "Failed to initiate payment"));
                    },
                }
            );
        }
    }, [orderId, isNonCod, paymentId, sagaId, paymentMethod, createPayment]);

    const handlePaymentSuccess = async () => {
        if (!orderId || !paymentId) return;
        setSimulating(true);
        try {
            await simulatePayment.mutateAsync({ orderId, paymentId });
            router.push(`/orders/${orderId}`);
        } catch (err) {
            setError(toErrorMessage(err, "Payment simulation failed"));
            setSimulating(false);
        }
    };

    const handlePaymentCancel = async () => {
        if (!orderId || !paymentId) return;
        setSimulating(true);
        try {
            await cancelPayment.mutateAsync({ orderId, paymentId });
            router.push(`/orders/${orderId}`);
        } catch (err) {
            setError(toErrorMessage(err, "Payment cancellation failed"));
            setSimulating(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F9F8FE] px-4">
                <div className="bg-white p-6 rounded-lg border border-red-200 text-center max-w-md">
                    <h2 className="text-lg font-semibold text-red-600 mb-2">
                        {t('order_error_title', {}, "Something went wrong")}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
                    <Button
                        onClick={() => router.push("/orders")}
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    >
                        {t('go_to_orders', {}, "Go to My Orders")}
                    </Button>
                </div>
            </div>
        );
    }

    if (orderId && isNonCod && !paymentId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F9F8FE]">
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#8AB0C3] opacity-30 animate-ping absolute" />
                    <div className="w-16 h-16 rounded-full bg-[#8AB0C3] flex items-center justify-center text-white text-xl font-bold">
                        💳
                    </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {t('initiating_payment', {}, "Initiating payment...")}
                </h2>
                <div className="flex gap-1 mb-6">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
            </div>
        );
    }

    if (orderId && isNonCod && paymentId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F9F8FE] px-4">
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-[#8AB0C3] flex items-center justify-center text-white text-3xl">
                        💳
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                    {t('payment_simulation_title', {}, "Payment Simulation")}
                </h2>
                <p className="text-sm text-gray-500 mb-8 text-center max-w-sm">
                    {t('payment_simulation_desc', {}, "This is a simulated payment environment. Choose an outcome to proceed.")}
                </p>

                <div className="flex gap-4">
                    <Button
                        onClick={handlePaymentSuccess}
                        disabled={simulating}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold min-w-40"
                    >
                        {t('payment_success', {}, "Payment Successful")}
                    </Button>
                    <Button
                        onClick={handlePaymentCancel}
                        disabled={simulating}
                        variant="destructive"
                        className="font-semibold min-w-40"
                    >
                        {t('payment_failed', {}, "Payment Failed")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F9F8FE]">
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-[#8AB0C3] opacity-30 animate-ping absolute" />
                <div className="w-16 h-16 rounded-full bg-[#8AB0C3] flex items-center justify-center text-white text-xl font-bold">
                    🛒
                </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2 transition-all duration-500">
                {steps[step]}
            </h2>

            <div className="flex gap-1 mb-6">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            </div>

            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#8AB0C3] transition-all duration-700"
                    style={{ width: `${(step + 1) * 25}%` }}
                />
            </div>

            <p className="text-sm text-gray-500 mt-4">
                {t('order_processing_wait', {}, "Please do not close this page while we process your order")}
            </p>
        </div>
    );
}
