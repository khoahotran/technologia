/**
 * Thành phần Thẻ Thống kê (Stat Card Component)
 * 
 * Hiển thị một con số thống kê nổi bật kèm theo nhãn dãn và biểu tượng.
 * Dùng nhiều trong phần giới thiệu về quy mô, thành tựu của công ty.
 */
import type { LucideIcon } from "lucide-react"

import { cn } from "@/utils/cn"

interface StatCardProps {
  /** Giá trị thống kê (Ví dụ: "10K+", "50+") */
  value: string
  /** Nhãn mô tả cho giá trị thống kê (Ví dụ: "Khách hàng", "Đối tác") */
  label: string
  /** Biểu tượng minh họa từ thư viện lucide-react */
  icon: LucideIcon
  /** Class CSS định dạng màu sắc cho biểu tượng */
  iconColor?: string
}

export function StatCard({ value, label, icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <div className="bg-accent rounded-2xl p-6 min-w-[200px] flex-shrink-0">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <div className={cn("p-2 bg-white/50 rounded-lg", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm text-gray-700">{label}</p>
    </div>
  )
}
