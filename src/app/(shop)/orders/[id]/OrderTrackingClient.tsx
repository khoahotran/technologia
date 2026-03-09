"use client"

import { ArrowLeft, Trash2, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import { useState, useMemo } from "react"

import { OrderCard } from "@/components/features/orders/OrderCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOrder, useOrders } from "@/features/checkout/hooks"
import type { Address } from "@/features/checkout/types"
import { useLanguage } from "@/providers/language.provider"

function toReadableAddress(address: Address | undefined) {
    if (!address) return "";
    return `${address.no} ${address.street}, ${address.ward}, ${address.city}, ${address.province}`;
}

export default function OrderTrackingClient({ id }: { id: string }) {
    const { t, locale } = useLanguage()
    const currentLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    const [searchOrderId, setSearchOrderId] = useState("")

    const { data: order, isLoading: isLoadingOrder, isError: isErrorOrder } = useOrder(id);
    const { data: allOrders = [] } = useOrders();

    const deliveredOrders = useMemo(() => {
        return allOrders
            .filter(o => o.status === 'delivered')
            .map(o => ({
                orderId: o.id,
                items: o.items.map(item => ({ quantity: item.quantity, name: item.name }))
            }));
    }, [allOrders]);

    if (isLoadingOrder) {
        return <div className="flex justify-center p-8">{t('loading', {}, "Loading...")}</div>;
    }

    if (isErrorOrder || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t('order_not_found', {}, "Order not found")}</h2>
                <p className="text-gray-600 mt-2">{t('order_not_found_desc', {}, "We couldn't find the order you're looking for.")}</p>
                <Link href="/orders" className="inline-block mt-4 text-[#3E93B3] font-medium">{t('back_to_orders', {}, "Back to list of orders")}</Link>
            </div>
        );
    }

    // Mock timeline as backend might not provide full history yet
    const timeline = [
        { status: t('status_order_created', {}, "Order created"), date: order.createdAt, completed: true },
        { status: t('status_payment_success', {}, "Payment success"), date: order.createdAt, completed: order.status !== 'created' },
        { status: t('status_on_shipping', {}, "On shipping"), date: order.createdAt, completed: ['shipping', 'delivered'].includes(order.status) },
        { status: t('status_order_delivered', {}, "Order delivered"), date: order.createdAt, completed: order.status === 'delivered' },
    ];

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status Notes */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
                            <h3 className="font-bold text-gray-900">{t('tracking_note_title', {}, "Note for tracking order")}</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium text-gray-900">{t('status_order_created', {}, "Status: Order created")}</p>
                                    <Button variant="secondary" className="w-full mt-2 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white">
                                        {t('cancel_order', {}, "Cancel Order")}
                                    </Button>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t('status_payment_success', {}, "Status: Payment success [Done]")}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t('status_on_shipping', {}, "Status: On shipping")}</p>
                                    <Button variant="secondary" className="w-full mt-2 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white">
                                        {t('order_received_btn', {}, "Order received")}
                                    </Button>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t('status_order_delivered', {}, "Status: Order delivered")}</p>
                                    <Button variant="secondary" className="w-full mt-2 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white">
                                        {t('give_feedback_btn', {}, "Give feedback")}
                                    </Button>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t('after_giving_feedback', {}, "After giving feedback")}</p>
                                    <Button variant="secondary" className="w-full mt-2 bg-[#C3BFCE] hover:bg-[#B3AFBE] text-white">
                                        {t('see_feedback_btn', {}, "See feedback")}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Delivered Orders */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">{t('delivered_orders_title', {}, "Delivered Orders")}</h3>
                                <div className="bg-[#3E93B3] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {deliveredOrders.length}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {deliveredOrders.map((order, index) => (
                                    <OrderCard
                                        key={index}
                                        orderId={order.orderId}
                                        items={order.items}
                                        status="delivered"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Back to list */}
                        <Link href="/orders" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="font-medium">{t('back_to_orders', {}, "Back to list of orders")}</span>
                        </Link>

                        {/* Track Order Section */}
                        <div className="bg-[#D4A574] p-8 rounded-xl text-center space-y-4">
                            <h1 className="text-2xl font-bold text-white">{t('track_your_order_title', {}, "Track Your Order")}</h1>
                            <p className="text-white/90">{t('track_order_desc', {}, "Stay updated on your delivery status")}</p>

                            <div className="max-w-md mx-auto flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder={t('order_id_placeholder', {}, "Order ID")}
                                        value={searchOrderId}
                                        onChange={(e) => setSearchOrderId(e.target.value)}
                                        className="bg-white h-12"
                                    />
                                    <button
                                        onClick={() => setSearchOrderId("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <Trash2 className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>
                                <Button className="bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white h-12 px-6">
                                    {t('track_order_btn', {}, "Track order")}
                                </Button>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-bold text-gray-900">{t('order_id_label', {}, "Order ID")}</h2>
                                    <p className="text-lg font-medium text-gray-700">{order.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">{order.status}</p>
                                    <p className="text-sm font-medium text-gray-900">{order.createdAt}</p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-4">
                                {timeline.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            {item.completed ? (
                                                <CheckCircle2 className="h-5 w-5 text-[#3E93B3]" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-gray-300" />
                                            )}
                                            {index < timeline.length - 1 && (
                                                <div className="w-0.5 h-12 bg-gray-200 my-1" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-medium text-gray-900">{item.status}</p>
                                            <p className="text-sm text-gray-500">{item.date}</p>
                                            {item.status === t('status_on_shipping', {}, "On shipping") && (
                                                <p className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: t('timeline_desc_shipping', {}, "Your order has been picked up by the carrier.<br />Your order is currently at [location].") }} />
                                            )}
                                            {item.status === t('status_payment_success', {}, "Payment success") && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {t('timeline_desc_paid', {}, "Your order has been successfully paid using [payment method].")}
                                                </p>
                                            )}
                                            {item.status === t('status_order_created', {}, "Order created") && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {t('timeline_desc_created', {}, "Your order has been created and is waiting for confirmation.")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Items */}
                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.quantity}x</span>
                                        <span className="flex-1 ml-4 text-gray-900">{item.name}</span>
                                        <span className="font-medium text-[#3E93B3]">
                                            {t('price_vnd', { price: new Intl.NumberFormat(currentLocale).format(item.unitPrice) }, `${new Intl.NumberFormat(currentLocale).format(item.unitPrice)} VND`)}
                                        </span>
                                    </div>
                                ))}
                                <div className="text-sm text-[#3E93B3] cursor-pointer hover:underline">
                                    {order.status}
                                </div>
                            </div>

                            {/* Give Feedback Button */}
                            <Link href={`/orders/${id}/feedback`}>
                                <Button className="w-full bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white h-12">
                                    {t('give_feedback_btn', {}, "Give feedback")}
                                </Button>
                            </Link>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">{t('shipping_address_title', {}, "Shipping Address")}</h3>
                            <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-900">{order.shippingAddress.receiverName}</p>
                                <p className="text-gray-600">{toReadableAddress(order.shippingAddress)}</p>
                                <p className="text-gray-600">{order.shippingAddress.receiverPhoneNumber}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-gray-900">{t('payment_info_title', {}, "Payment Info")}</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">{t('payment_method_label', {}, "Payment Method")}</p>
                                <p className="font-medium text-gray-900">
                                    {order.paymentMethod === 'bank' && t('direct_bank_transfer', {}, "Direct bank transfer")}
                                    {order.paymentMethod === 'wallet' && t('e_wallet', {}, "E-wallet")}
                                    {order.paymentMethod === 'cod' && t('cash_on_delivery', {}, "Cash on delivery")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
