"use client"


import { cn } from "@/lib/utils"

interface OrderCardProps {
  orderId: string
  items: { quantity: number; name: string }[]
  status: "created" | "shipping" | "delivered" | "cancelled"
  className?: string
}

export function OrderCard({ orderId, items, status, className }: OrderCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "created":
        return "bg-[#8AB0C3]"
      case "shipping":
        return "bg-[#8AB0C3]"
      case "delivered":
        return "bg-[#F4A460]"
      case "cancelled":
        return "bg-[#8AB0C3]"
      default:
        return "bg-[#8AB0C3]"
    }
  }

  return (
    <div className={cn("bg-white rounded-lg border border-gray-100 overflow-hidden", className)}>
      <div className={cn("px-4 py-2 text-white text-sm font-medium", getStatusColor())}>
        #{orderId}
      </div>
      <div className="p-4 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 text-sm text-gray-600">
            <span>{item.quantity}x</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface OrderCategoryProps {
  title: string
  icon: React.ReactNode
  count?: number
  orders: Array<{ orderId: string; items: { quantity: number; name: string }[] }>
  status: "created" | "shipping" | "delivered" | "cancelled"
}

export function OrderCategory({ title, icon, count, orders, status }: OrderCategoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#D3E4F4] rounded-xl">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {count !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">Orders</span>
              <div className="bg-[#F4A460] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {orders.slice(0, 3).map((order) => (
          <OrderCard
            key={order.orderId}
            orderId={order.orderId}
            items={order.items}
            status={status}
          />
        ))}
      </div>

      {orders.length > 3 && (
        <button className="text-sm text-[#3E93B3] hover:underline font-medium">
          View more
        </button>
      )}
    </div>
  )
}
