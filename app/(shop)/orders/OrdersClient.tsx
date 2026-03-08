"use client";

import { Package, Truck, PackageCheck, PackageX } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { OrderCategory } from "@/components/features/orders/OrderCard";
import { getCheckoutOrders, type CheckoutOrder } from "@/lib/checkout-flow";
import { useLanguage } from "@/shared/providers/language.provider";

/**
 * Trích xuất danh sách các mục trong đơn hàng để hiển thị trên UI.
 * @param order - Đối tượng đơn hàng chứa thông tin chi tiết
 * @returns Danh sách số lượng và tên sản phẩm
 */
function toOrderCardItems(order: CheckoutOrder) {
    return order.items.map((item) => ({
        quantity: item.quantity,
        name: item.name,
    }));
}

/**
 * Giao diện Danh sách Đơn hàng (Orders Client View)
 * 
 * Quản lý và phân loại các đơn hàng của người dùng theo trạng thái:
 * - Đơn hàng mới tạo (created)
 * - Đơn hàng đang giao (shipping)
 * - Đơn hàng đã hoàn thành (delivered)
 * - Đơn hàng đã hủy (cancelled)
 */
export default function OrdersClient() {
    const { t } = useLanguage();
    const [orders] = useState<CheckoutOrder[]>(() => getCheckoutOrders());

    const createdOrders = useMemo(
        () =>
            orders
                .filter((order) => order.status === "created")
                .map((order) => ({ orderId: order.id, items: toOrderCardItems(order) })),
        [orders]
    );
    const shippingOrders = useMemo(
        () =>
            orders
                .filter((order) => order.status === "shipping")
                .map((order) => ({ orderId: order.id, items: toOrderCardItems(order) })),
        [orders]
    );
    const deliveredOrders = useMemo(
        () =>
            orders
                .filter((order) => order.status === "delivered")
                .map((order) => ({ orderId: order.id, items: toOrderCardItems(order) })),
        [orders]
    );
    const cancelledOrders = useMemo(
        () =>
            orders
                .filter((order) => order.status === "cancelled")
                .map((order) => ({ orderId: order.id, items: toOrderCardItems(order) })),
        [orders]
    );

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('list_of_orders', {}, "List Of Orders")}</h1>

                {orders.length === 0 ? (
                    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-gray-100 text-center">
                        <p className="text-gray-600">{t('no_orders', {}, "You have no orders yet.")}</p>
                        <Link href="/products" className="inline-block mt-4 text-[#3E93B3] font-medium">
                            {t('start_shopping', {}, "Start shopping")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <OrderCategory
                            title={t('created_orders', {}, "Created Orders")}
                            icon={<Package className="h-6 w-6 text-[#3E93B3]" />}
                            count={createdOrders.length}
                            orders={createdOrders}
                            status="created"
                        />

                        <OrderCategory
                            title={t('shipping_orders', {}, "Paid and on shipping")}
                            icon={<Truck className="h-6 w-6 text-[#3E93B3]" />}
                            count={shippingOrders.length}
                            orders={shippingOrders}
                            status="shipping"
                        />

                        <OrderCategory
                            title={t('delivered_orders', {}, "Delivered Orders")}
                            icon={<PackageCheck className="h-6 w-6 text-[#3E93B3]" />}
                            orders={deliveredOrders}
                            status="delivered"
                        />

                        <OrderCategory
                            title={t('cancelled_orders', {}, "Cancelled Orders")}
                            icon={<PackageX className="h-6 w-6 text-[#3E93B3]" />}
                            orders={cancelledOrders}
                            status="cancelled"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
