"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCancelPayment, useCreatePayment, useGetOrderIdBySagaId, usePaymentQrCode, useSimulatePayment } from "@/features/orders/hooks";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

export default function OrderProcessingPage() {
    const { t, locale } = useLanguage();
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
    const { data: qrData, isLoading: isLoadingQr } = usePaymentQrCode(paymentId || "", Boolean(paymentId));

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

    // Handle final redirection for COD or when simulation is skipped
    useEffect(() => {
        if (orderId && !isNonCod) {
            // Short delay to let the user see the "Finalizing" state
            const timer = setTimeout(() => {
                router.push(`/orders/${orderId}`);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [orderId, isNonCod, router]);

    useEffect(() => {
        if (orderId && isNonCod && !paymentId && !createPayment.isPending) {
            createPayment.mutate(
                { orderId, sagaId: sagaId! },
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
    }, [orderId, isNonCod, paymentId, sagaId, createPayment.isPending]);

    const handlePaymentSuccess = async () => {
        if (!orderId || !paymentId) return;
        setSimulating(true);
        try {
            await simulatePayment.mutateAsync({ orderId, paymentId, sagaId: sagaId! });
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
            await cancelPayment.mutateAsync({ orderId, paymentId, sagaId: sagaId! });
            router.push(`/orders/${orderId}`);
        } catch (err) {
            setError(toErrorMessage(err, "Payment cancellation failed"));
            setSimulating(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background px-4">
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
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full bg-secondary opacity-30 animate-ping absolute" />
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white text-xl font-bold">
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl">
                            💳
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                        {t('payment_simulation_title', {}, "Payment Simulation")}
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 text-center">
                        {t('payment_simulation_desc', {}, "Please scan the QR code below or choose an outcome to simulate the payment.")}
                    </p>

                    <div className="bg-white p-6 rounded-2xl border-2 border-primary/20 shadow-inner mb-8">
                        {isLoadingQr ? (
                            <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-400 animate-pulse">{t('loading', {}, "Loading...")}</span>
                            </div>
                        ) : qrData?.qrCode ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={
                                    qrData.qrCode.startsWith('http') || qrData.qrCode.startsWith('data:image')
                                        ? qrData.qrCode
                                        : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.qrCode)}`
                                }
                                alt="Payment QR Code"
                                className="w-48 h-48 object-contain"
                            />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed">
                                <span className="text-xs text-gray-400 text-center px-4">
                                    {t('qr_failed', {}, "Could not load QR code from server")}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button
                            onClick={handlePaymentSuccess}
                            disabled={simulating}
                            className="bg-primary hover:bg-primary-hover text-white font-bold h-12 rounded-xl transition-all active:scale-95"
                        >
                            {t('payment_success', {}, "Success")}
                        </Button>
                        <Button
                            onClick={handlePaymentCancel}
                            disabled={simulating}
                            variant="destructive"
                            className="bg-destructive font-bold h-12 rounded-xl transition-all active:scale-95"
                        >
                            {t('payment_failed', {}, "Cancel")}
                        </Button>
                    </div>

                    {qrData?.expiredAt && (
                        <p className="mt-6 text-xs text-muted-foreground italic">
                            {(() => {
                                const date = new Date(qrData.expiredAt);
                                const timeStr = locale === 'vi'
                                    ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                    : `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;

                                return t('qr_expired_at', { time: timeStr }, `Expires at ${timeStr}`);
                            })()}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-secondary opacity-30 animate-ping absolute" />
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white text-xl font-bold">
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
                    className="h-full bg-secondary transition-all duration-700"
                    style={{ width: `${(step + 1) * 25}%` }}
                />
            </div>

            <p className="text-sm text-gray-500 mt-4">
                {t('order_processing_wait', {}, "Please do not close this page while we process your order")}
            </p>
        </div>
    );
}
