"use client"

/**
 * Các thành phần Quản lý Đơn hàng (Order Feature Components)
 * 
 * Chứa các thẻ hiển thị đơn hàng (OrderCard) và khu vực phân loại đơn hàng (OrderCategory).
 */
import { cn } from "@/lib/utils"
import { useLanguage } from "@/shared/providers/language.provider"

interface OrderCardProps {
  /** Mã định danh đơn hàng */
  orderId: string
  /** Danh sách các sản phẩm (tên và số lượng) trong đơn hàng */
  items: { quantity: number; name: string }[]
  /** Trạng thái hiện tại của đơn hàng */
  status: "created" | "shipping" | "delivered" | "cancelled"
  className?: string
}

/**
 * Thành phần Thẻ Đơn hàng (Order Card)
 * Hiển thị tóm tắt thông tin một đơn hàng cụ thể, với màu sắc tương ứng với trạng thái.
 */
export function OrderCard({ orderId, items, status, className }: OrderCardProps) {
  // Hàm lấy màu nền tương ứng cho phần Tiêu đề thẻ dựa trên trạng thái
  const getStatusColor = () => {
    switch (status) {
      case "created":
        return "bg-[#8AB0C3]" // Xám xanh dương
      case "shipping":
        return "bg-[#8AB0C3]"
      case "delivered":
        return "bg-[#F4A460]" // Cam đất (thể hiện hoàn thành/quan trọng)
      case "cancelled":
        return "bg-[#8AB0C3]"
      default:
        return "bg-[#8AB0C3]"
    }
  }

  return (
    <div className={cn("bg-white rounded-lg border border-gray-100 overflow-hidden", className)}>
      {/* Tiêu đề/Trạng thái Thẻ */}
      <div className={cn("px-4 py-2 text-white text-sm font-medium", getStatusColor())}>
        #{orderId}
      </div>
      {/* Nội dung các mặt hàng */}
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
  /** Tiêu đề danh mục trạng thái (Ví dụ: "Chờ xác nhận", "Đang giao") */
  title: string
  /** Biểu tượng đại diện (từ lucide-react) */
  icon: React.ReactNode
  /** Tổng số lượng đơn hàng trong trạng thái này */
  count?: number
  /** Danh sách dữ liệu các đơn hàng để hiển thị */
  orders: Array<{ orderId: string; items: { quantity: number; name: string }[] }>
  /** Trạng thái chung của cột này */
  status: "created" | "shipping" | "delivered" | "cancelled"
}

/**
 * Thành phần Danh mục Đơn hàng (Order Category)
 * Hiển thị một cột hoặc danh sách chứa các Thẻ Đơn hàng (OrderCard) có cùng trạng thái.
 */
export function OrderCategory({ title, icon, count, orders, status }: OrderCategoryProps) {
  const { t } = useLanguage()
  return (
    <div className="space-y-4">
      {/* Khối Tiêu đề danh mục */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#D3E4F4] rounded-xl">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {count !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">{t('orders_label', {}, "Orders")}</span>
              <div className="bg-[#F4A460] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách hiển thị đơn hàng (giới hạn 3 đơn hàng đầu tiên) */}
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

      {/* Nút tải thêm nếu vượt quá 3 đơn hàng */}
      {orders.length > 3 && (
        <button className="text-sm text-[#3E93B3] hover:underline font-medium">
          {t('view_more', {}, "View more")}
        </button>
      )}
    </div>
  )
}
