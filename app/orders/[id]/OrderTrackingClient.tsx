"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Trash2, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderCard } from "@/components/features/orders/OrderCard"

export default function OrderTrackingClient({ id }: { id: string }) {
    const [orderId, setOrderId] = useState("")

    // Mock data
    const order = {
        id: "#123456789ABCXYZ",
        items: [
            { quantity: 1, name: "Product name", price: 1000000 },
            { quantity: 1, name: "Product name", price: 1000000 },
        ],
        total: 2000000,
        status: "delivered",
        timeline: [
            { status: "Order created", date: "Wed, 15 Oct 2025, 9:09 AM", completed: true },
            { status: "Payment success", date: "Wed, 15 Oct 2025, 9:19 AM", completed: true },
            { status: "On shipping", date: "Thu, 16 Oct 2025, 1:00 PM", completed: true },
            { status: "Order delivered", date: "Sat, 18 Oct 2025, 2:24 PM", completed: true },
        ],
        shippingAddress: {
            name: "Name",
            address: "Address line 1, Address line 2, City, Province, Postal Code",
            phone: "Phone Number: 123456789",
            email: "Email: customer@example.com",
        },
        paymentInfo: {
            method: "Name",
            bankName: "Bank/E-wallet name: Bank",
            accountNumber: "Account Number: 123456789",
            note: "Payment note details here",
        },
    }

    const deliveredOrders = [
        {
            orderId: "orderid",
            items: [
                { quantity: 1, name: "Product name" },
                { quantity: 1, name: "Product name" },
            ],
        },
        {
            orderId: "orderid",
            items: [
                { quantity: 1, name: "Product name" },
            ],
        },
    ]

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            {/* Header with categories */}
            <div className="bg-white py-4 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-between text-sm font-medium text-gray-600">
                        <li>All categories</li>
                        <li>Smartphone</li>
                        <li>Laptop</li>
                        <li>Gaming Equipment</li>
                        <li>Headphone</li>
                        <li>Speaker</li>
                        <li>Others</li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status Notes */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
                            <h3 className="font-bold text-gray-900">Note for tracking order</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium text-gray-900">Status: Order created</p>
                                    <Button variant="secondary" className="w-full mt-2 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white">
                                        Cancel Order
                                    </Button>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Status: Payment success [Done]</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Status: On shipping</p>
                                    <Button variant="secondary" className="w-full mt-2 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white">
                                        Order received
                                    </Button>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Status: Order delivered</p>
                                    <Button variant="secondary" className="w-full mt-2 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white">
                                        Give feedback
                                    </Button>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">After giving feedback</p>
                                    <Button variant="secondary" className="w-full mt-2 bg-[#C3BFCE] hover:bg-[#B3AFBE] text-white">
                                        See feedback
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Delivered Orders */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Delivered Orders</h3>
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
                            <span className="font-medium">Back to list of orders</span>
                        </Link>

                        {/* Track Order Section */}
                        <div className="bg-[#D4A574] p-8 rounded-xl text-center space-y-4">
                            <h1 className="text-2xl font-bold text-white">Track Your Order</h1>
                            <p className="text-white/90">Stay updated on your delivery status</p>

                            <div className="max-w-md mx-auto flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Order ID"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="bg-white h-12"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Trash2 className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>
                                <Button className="bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white h-12 px-6">
                                    Track order
                                </Button>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-bold text-gray-900">Order ID</h2>
                                    <p className="text-lg font-medium text-gray-700">{order.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Order delivered</p>
                                    <p className="text-sm font-medium text-gray-900">Sat, 18 Oct 2025, 2:24 PM</p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-4">
                                {order.timeline.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            {item.completed ? (
                                                <CheckCircle2 className="h-5 w-5 text-[#3E93B3]" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-gray-300" />
                                            )}
                                            {index < order.timeline.length - 1 && (
                                                <div className="w-0.5 h-12 bg-gray-200 my-1" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-medium text-gray-900">{item.status}</p>
                                            <p className="text-sm text-gray-500">{item.date}</p>
                                            {item.status === "On shipping" && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Your order has been picked up by the carrier.<br />
                                                    Your order is currently at [location].
                                                </p>
                                            )}
                                            {item.status === "Payment success" && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Your order has been successfully paid using [payment method].
                                                </p>
                                            )}
                                            {item.status === "Order created" && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Your order has been created and is waiting for confirmation.
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
                                            {new Intl.NumberFormat("vi-VN").format(item.price)} VND
                                        </span>
                                    </div>
                                ))}
                                <div className="text-sm text-[#3E93B3] cursor-pointer hover:underline">
                                    [Order status]
                                </div>
                            </div>

                            {/* Give Feedback Button */}
                            <Link href={`/orders/${id}/feedback`}>
                                <Button className="w-full bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white h-12">
                                    Give feedback
                                </Button>
                            </Link>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Shipping Address</h3>
                            <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                                <p className="text-gray-600">{order.shippingAddress.address}</p>
                                <p className="text-gray-600">{order.shippingAddress.phone}</p>
                                <p className="text-gray-600">{order.shippingAddress.email}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-gray-900">Payment Info</h3>
                                <span className="text-sm text-[#3E93B3] cursor-pointer hover:underline">
                                    [Payment status]
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">Payment Method</p>
                                <p className="font-medium text-gray-900">{order.paymentInfo.method}</p>
                                <p className="text-gray-600">{order.paymentInfo.bankName}</p>
                                <p className="text-gray-600">{order.paymentInfo.accountNumber}</p>
                                <div className="pt-2">
                                    <p className="text-gray-600">Note:</p>
                                    <p className="text-gray-600 whitespace-pre-wrap">{order.paymentInfo.note}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
