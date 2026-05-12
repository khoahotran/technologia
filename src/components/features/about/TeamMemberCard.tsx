/**
 * Thành phần Thẻ Thành viên Đội ngũ (Team Member Card Component)
 * 
 * Hiển thị thông tin cá nhân của một thành viên trong công ty, bao gồm 
 * hình ảnh đại diện, tên, chức vụ và một đoạn mô tả ngắn.
 * Nếu không có hình ảnh mặc định sẽ hiển thị chữ cái đầu của tên.
 */
interface TeamMemberCardProps {
  /** Họ tên thành viên */
  name: string
  /** Chức vụ / Vai trò (Ví dụ: "CEO", "Trưởng phòng Kỹ thuật") */
  role: string
  /** Đoạn mô tả ngắn gọn về thành viên */
  description: string
  /** Đường dẫn đến hình ảnh đại diện (Tùy chọn) */
  imageUrl?: string
}

export function TeamMemberCard({ name, role, description, imageUrl }: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 min-w-[280px] flex-shrink-0 border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Vùng chứa ảnh đại diện */}
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
          )}
        </div>

        {/* Thông tin cơ bản */}
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>

        {/* Đoạn mô tả */}
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
