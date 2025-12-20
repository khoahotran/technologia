"use client"

import { Package, Truck, PackageCheck, PackageX } from "lucide-react"

import { OrderCategory } from "@/components/features/orders/OrderCard"

export default function OrdersClient() {
    // Mock data
    const createdOrders = [
        {
            orderId: "orderid",
            items: [
                { quantity: 1, name: "Product name" },
                { quantity: 1, name: "Product name" },
                { quantity: 1, name: "Product name" },
                { quantity: 1, name: "Product name" },
            ],
        },
        {
            orderId: "orderid",
            items: [
                { quantity: 1, name: "Product name" },
                { quantity: 1, name: "Product name" },
            ],
        },
    ]

    const shippingOrders = [
        {
            orderId: "orderid",
            items: [
                { quantity: 1, name: "Product name" },
                { quantity: 1, name: "Product name" },
                { quantity: 1, name: "Product name" },
            ],
        },
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
        {
            orderId: "orderid",
            items: [
                { quantity: 1, name: "Product name" },
                { quantity: 1, name: "Product name" },
            ],
        },
    ]

    const cancelledOrders = [
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
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">List Of Orders</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <OrderCategory
                        title="Created Orders"
                        icon={<Package className="h-6 w-6 text-[#3E93B3]" />}
                        count={createdOrders.length}
                        orders={createdOrders}
                        status="created"
                    />

                    <OrderCategory
                        title="Paid and on shipping"
                        icon={<Truck className="h-6 w-6 text-[#3E93B3]" />}
                        count={shippingOrders.length}
                        orders={shippingOrders}
                        status="shipping"
                    />

                    <OrderCategory
                        title="Delivered Orders"
                        icon={<PackageCheck className="h-6 w-6 text-[#3E93B3]" />}
                        orders={deliveredOrders}
                        status="delivered"
                    />

                    <OrderCategory
                        title="Cancelled Orders"
                        icon={<PackageX className="h-6 w-6 text-[#3E93B3]" />}
                        orders={cancelledOrders}
                        status="cancelled"
                    />
                </div>
            </div>
        </div>
    )
}
