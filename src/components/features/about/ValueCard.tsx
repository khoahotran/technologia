/**
 * Thành phần Thẻ Giá trị Cốt lõi (Value Card Component)
 * 
 * Hiển thị một giá trị cốt lõi của công ty (Ví dụ: "Chất lượng", "Sáng tạo")
 * dưới dạng một thẻ đơn giản với tiêu đề và mô tả.
 */
interface ValueCardProps {
  /** Tiêu đề của giá trị cốt lõi */
  title: string
  /** Nội dung giải thích chi tiết về giá trị đó */
  description: string
}

export function ValueCard({ title, description }: ValueCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
