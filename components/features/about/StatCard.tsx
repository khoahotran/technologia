import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  value: string
  label: string
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({ value, label, icon: Icon, iconColor = "text-[#3E93B3]" }: StatCardProps) {
  return (
    <div className="bg-[#D3E4F4] rounded-2xl p-6 min-w-[200px] flex-shrink-0">
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

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
